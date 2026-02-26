import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceItem, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, InvoiceStatsDto } from './dto/invoice.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { client_id, items, ...invoiceData } = createInvoiceDto;

    // Verify client exists
    const client = await this.userRepository.findOne({ where: { id: client_id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = (invoiceData.tax_rate || 0) * subtotal / 100;
    const totalAmount = subtotal + taxAmount - (invoiceData.discount_amount || 0);

    // Create invoice
    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      client_id,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      invoice_number: await this.generateInvoiceNumber(),
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create invoice items
    const invoiceItems = items.map(item => {
      const totalPrice = item.quantity * item.unit_price;
      return this.invoiceItemRepository.create({
        ...item,
        total_price: totalPrice,
        invoice: savedInvoice,
      });
    });

    await this.invoiceItemRepository.save(invoiceItems);

    return this.findOne(savedInvoice.id);
  }

  async findAll(page: number = 1, limit: number = 10, status?: InvoiceStatus, clientId?: string): Promise<{ invoices: Invoice[]; total: number }> {
    const qb = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.items', 'items')
      .orderBy('invoice.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('invoice.status = :status', { status });
    if (clientId) qb.andWhere('invoice.client_id = :clientId', { clientId });

    const [invoices, total] = await qb.getManyAndCount();
    return { invoices, total };
  }

  async getClientRevenue(clientId: string): Promise<{ totalRevenue: number; paidCount: number; pendingAmount: number }> {
    const paid = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total_amount), 0)', 'total')
      .where('invoice.client_id = :clientId', { clientId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne();
    const pending = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('COALESCE(SUM(invoice.total_amount), 0)', 'total')
      .where('invoice.client_id = :clientId', { clientId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.SENT })
      .getRawOne();
    const paidCount = await this.invoiceRepository.count({
      where: { client_id: clientId, status: InvoiceStatus.PAID },
    });
    return {
      totalRevenue: parseFloat(paid?.total || '0'),
      paidCount,
      pendingAmount: parseFloat(pending?.total || '0'),
    };
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['client', 'items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    const { client_id, items, ...updateData } = updateInvoiceDto;

    // Update client if provided
    if (client_id) {
      const client = await this.userRepository.findOne({ where: { id: client_id } });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
      updateData['client_id'] = client_id;
    }

    // Update items if provided
    if (items) {
      // Remove existing items
      await this.invoiceItemRepository.delete({ invoice: { id } });

      // Calculate new totals
      const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const taxAmount = (updateData.tax_rate || invoice.tax_rate) * subtotal / 100;
      const totalAmount = subtotal + taxAmount - (updateData.discount_amount || invoice.discount_amount);

      updateData['subtotal'] = subtotal;
      updateData['tax_amount'] = taxAmount;
      updateData['total_amount'] = totalAmount;

      // Create new items
      const invoiceItems = items.map(item => {
        const totalPrice = item.quantity * item.unit_price;
        return this.invoiceItemRepository.create({
          ...item,
          total_price: totalPrice,
          invoice,
        });
      });

      await this.invoiceItemRepository.save(invoiceItems);
    }

    // Update invoice
    await this.invoiceRepository.update(id, updateData);
    return this.findOne(id);
  }

  async updateStatus(id: number, updateStatusDto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.findOne(id);

    const updateData: any = { status: updateStatusDto.status };

    if (updateStatusDto.status === InvoiceStatus.PAID) {
      updateData.payment_date = updateStatusDto.payment_date || new Date();
      updateData.payment_method = updateStatusDto.payment_method;
      updateData.payment_reference = updateStatusDto.payment_reference;
    }

    await this.invoiceRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    await this.invoiceRepository.remove(invoice);
  }

  async getStats(): Promise<InvoiceStatsDto> {
    const totalInvoices = await this.invoiceRepository.count();
    
    const [totalRevenueResult] = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total_amount)', 'total')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne();

    const paidInvoices = await this.invoiceRepository.count({ where: { status: InvoiceStatus.PAID } });
    const pendingInvoices = await this.invoiceRepository.count({ where: { status: InvoiceStatus.SENT } });
    const draftInvoices = await this.invoiceRepository.count({ where: { status: InvoiceStatus.DRAFT } });
    const overdueInvoices = await this.invoiceRepository.count({ 
      where: { 
        status: InvoiceStatus.SENT,
        due_date: Between(new Date('1900-01-01'), new Date())
      } 
    });

    // Calculate monthly revenue
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const [monthlyRevenueResult] = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total_amount)', 'monthly')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.payment_date BETWEEN :start AND :end', { 
        start: startOfMonth, 
        end: endOfMonth 
      })
      .getRawOne();

    // Calculate previous month for growth
    const startOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const endOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    const [prevMonthRevenueResult] = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.total_amount)', 'previous')
      .where('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.payment_date BETWEEN :start AND :end', { 
        start: startOfPrevMonth, 
        end: endOfPrevMonth 
      })
      .getRawOne();

    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');
    const monthlyRevenue = parseFloat(monthlyRevenueResult?.monthly || '0');
    const prevMonthRevenue = parseFloat(prevMonthRevenueResult?.previous || '0');

    const monthlyGrowth = prevMonthRevenue > 0 
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : monthlyRevenue > 0 ? 100 : 0;

    return {
      total_invoices: totalInvoices,
      total_revenue: totalRevenue,
      paid_invoices: paidInvoices,
      pending_invoices: pendingInvoices,
      draft_invoices: draftInvoices,
      overdue_invoices: overdueInvoices,
      monthly_revenue: monthlyRevenue,
      monthly_growth: monthlyGrowth,
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const lastInvoice = await this.invoiceRepository.findOne({
      order: { id: 'DESC' },
    });

    const nextNumber = lastInvoice ? lastInvoice.id + 1 : 1;
    return `INV-${nextNumber.toString().padStart(3, '0')}`;
  }

  async sendInvoice(id: number): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    await this.invoiceRepository.update(id, { 
      status: InvoiceStatus.SENT 
    });

    // Here you could add email sending logic
    // await this.emailService.sendInvoice(invoice);

    return this.findOne(id);
  }

  async duplicateInvoice(id: number): Promise<Invoice> {
    const originalInvoice = await this.findOne(id);
    
    const duplicateData = {
      client_id: originalInvoice.client_id,
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      payment_terms: originalInvoice.payment_terms,
      tax_rate: originalInvoice.tax_rate,
      discount_amount: originalInvoice.discount_amount,
      notes: originalInvoice.notes,
      terms_conditions: originalInvoice.terms_conditions,
      billing_address: originalInvoice.billing_address,
      billing_email: originalInvoice.billing_email,
      billing_phone: originalInvoice.billing_phone,
      items: originalInvoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
      })),
    };

    return this.create(duplicateData as CreateInvoiceDto);
  }
}