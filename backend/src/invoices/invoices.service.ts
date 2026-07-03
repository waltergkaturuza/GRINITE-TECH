import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceItem, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, InvoiceStatsDto } from './dto/invoice.dto';
import { User } from '../users/entities/user.entity';

const QUANTIS_COMPANY_DEFAULTS = {
  company_name: 'Quantis Technologies Private Limited',
  company_logo_url: '/quantis-letterhead.png',
  company_address: 'Suite R8, Kuwirirana House\nCnr Angwa and George Silundika, Harare',
  company_email: 'waltergkaturuza@gmail.com',
  company_phone: '+263777937721',
  company_website: 'https://www.quantistechnologies.co.zw',
  company_bank_name: 'CBZ',
  company_bank_branch: 'Southerton (Code: 6110)',
  company_account_name: 'Quantis Technologies',
  company_usd_account: '02327737470013',
  company_zig_account: '02327737470023',
};

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
    const {
      client_id, project_id, document_type = 'invoice', items,
      payment_date, payment_reference, payment_method, parent_invoice_id,
      ...invoiceData
    } = createInvoiceDto;
    const isReceipt = document_type === 'receipt';

    const client = await this.userRepository.findOne({ where: { id: client_id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    let parentInvoice: Invoice | null = null;
    if (isReceipt && parent_invoice_id) {
      parentInvoice = await this.invoiceRepository.findOne({
        where: { id: parent_invoice_id, document_type: 'invoice' },
      });
      if (!parentInvoice) {
        throw new NotFoundException('Linked invoice not found');
      }
    }

    const calcLineTotal = (item: { quantity: number; unit_price: number; discount_percent?: number }) => {
      const gross = item.quantity * item.unit_price;
      const discountPct = item.discount_percent || 0;
      return gross * (1 - discountPct / 100);
    };

    const subtotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);
    const taxAmount = (invoiceData.tax_rate || 0) * subtotal / 100;
    const totalAmount = subtotal + taxAmount - (invoiceData.discount_amount || 0);

    if (isReceipt && parentInvoice) {
      const balanceDue = parseFloat(String(parentInvoice.total_amount)) - parseFloat(String(parentInvoice.amount_paid || 0));
      if (totalAmount > balanceDue + 0.01) {
        throw new BadRequestException(`Payment amount (${totalAmount}) exceeds balance due (${balanceDue.toFixed(2)})`);
      }
    }

    const invoiceNumber = await this.generateInvoiceNumber(document_type);

    const invoiceDefaults = isReceipt ? {
      status: InvoiceStatus.PAID,
      payment_date: payment_date ? new Date(payment_date) : new Date(invoiceData.issue_date),
      payment_reference: payment_reference || parentInvoice?.invoice_number,
      payment_method: payment_method || 'Receipt',
      parent_invoice_id: parent_invoice_id || null,
      ...QUANTIS_COMPANY_DEFAULTS,
    } : {
      amount_paid: 0,
      ...QUANTIS_COMPANY_DEFAULTS,
    };

    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      ...invoiceDefaults,
      client_id,
      project_id: project_id || null,
      document_type: document_type || 'invoice',
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      invoice_number: invoiceNumber,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    const invoiceItems = items.map(item => {
      const totalPrice = calcLineTotal(item);
      return this.invoiceItemRepository.create({
        ...item,
        unit: item.unit || 'ea',
        total_price: totalPrice,
        invoice: savedInvoice,
      });
    });

    await this.invoiceItemRepository.save(invoiceItems);

    if (isReceipt && parent_invoice_id) {
      await this.syncParentInvoicePayments(parent_invoice_id);
    }

    const withItems = await this.invoiceRepository.findOne({
      where: { id: savedInvoice.id },
      relations: ['items'],
    });
    return withItems ?? savedInvoice;
  }

  async findAll(page: number = 1, limit: number = 10, status?: InvoiceStatus, clientId?: string, documentType?: string, search?: string): Promise<{ invoices: Invoice[]; total: number }> {
    const qb = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .leftJoinAndSelect('invoice.project', 'project')
      .leftJoinAndSelect('invoice.items', 'items')
      .orderBy('invoice.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) qb.andWhere('invoice.status = :status', { status });
    if (clientId) qb.andWhere('invoice.client_id = :clientId', { clientId });
    if (documentType) qb.andWhere('invoice.document_type = :documentType', { documentType });
    if (search && search.trim()) {
      qb.andWhere(
        '(invoice.invoice_number ILIKE :search OR client.firstName ILIKE :search OR client.lastName ILIKE :search OR client.email ILIKE :search)',
        { search: `%${search.trim()}%` }
      );
    }

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

  async findOne(id: number): Promise<any> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['client', 'project', 'items', 'parent_invoice'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.document_type === 'invoice') {
      const receipts = await this.invoiceRepository.find({
        where: { parent_invoice_id: id, document_type: 'receipt' },
        order: { created_at: 'ASC' },
      });
      return { ...invoice, receipts, balance_due: this.getBalanceDue(invoice) };
    }

    return invoice;
  }

  async getOpenInvoices(): Promise<any[]> {
    const invoices = await this.invoiceRepository.find({
      where: [
        { document_type: 'invoice', status: InvoiceStatus.SENT },
        { document_type: 'invoice', status: InvoiceStatus.PARTIALLY_PAID },
        { document_type: 'invoice', status: InvoiceStatus.OVERDUE },
      ],
      relations: ['client'],
      order: { created_at: 'DESC' },
    });
    return invoices.map(inv => ({
      ...inv,
      balance_due: this.getBalanceDue(inv),
    }));
  }

  async getInvoiceReceipts(id: number): Promise<Invoice[]> {
    await this.findOne(id);
    return this.invoiceRepository.find({
      where: { parent_invoice_id: id, document_type: 'receipt' },
      order: { created_at: 'ASC' },
    });
  }

  private getBalanceDue(invoice: Invoice): number {
    const total = parseFloat(String(invoice.total_amount || 0));
    const paid = parseFloat(String(invoice.amount_paid || 0));
    return Math.max(0, total - paid);
  }

  private async syncParentInvoicePayments(parentInvoiceId: number): Promise<void> {
    const parent = await this.invoiceRepository.findOne({ where: { id: parentInvoiceId } });
    if (!parent || parent.document_type !== 'invoice') return;

    const receipts = await this.invoiceRepository.find({
      where: { parent_invoice_id: parentInvoiceId, document_type: 'receipt' },
    });

    const amountPaid = receipts.reduce(
      (sum, r) => sum + parseFloat(String(r.total_amount || 0)),
      0,
    );
    const total = parseFloat(String(parent.total_amount || 0));
    let status = parent.status;

    if (amountPaid >= total - 0.01) {
      status = InvoiceStatus.PAID;
    } else if (amountPaid > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    } else if (parent.status === InvoiceStatus.PAID || parent.status === InvoiceStatus.PARTIALLY_PAID) {
      status = InvoiceStatus.SENT;
    }

    await this.invoiceRepository.update(parentInvoiceId, {
      amount_paid: amountPaid,
      status,
      payment_date: amountPaid >= total - 0.01 ? new Date() : parent.payment_date,
    });
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    if (invoice.status === InvoiceStatus.PAID && invoice.document_type !== 'receipt') {
      throw new BadRequestException('Cannot update a paid invoice');
    }

    const oldParentId = invoice.parent_invoice_id;
    const { client_id, project_id, document_type, items, payment_date, payment_reference, payment_method, parent_invoice_id, ...updateData } = updateInvoiceDto;

    if (project_id !== undefined) updateData['project_id'] = project_id || null;
    if (document_type) updateData['document_type'] = document_type;
    if (payment_date) updateData['payment_date'] = new Date(payment_date);
    if (payment_reference !== undefined) updateData['payment_reference'] = payment_reference;
    if (payment_method !== undefined) updateData['payment_method'] = payment_method;
    if (parent_invoice_id !== undefined) updateData['parent_invoice_id'] = parent_invoice_id || null;

    const calcLineTotal = (item: { quantity: number; unit_price: number; discount_percent?: number }) => {
      const gross = item.quantity * item.unit_price;
      const discountPct = item.discount_percent || 0;
      return gross * (1 - discountPct / 100);
    };

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
      const subtotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);
      const taxAmount = (updateData.tax_rate ?? invoice.tax_rate) * subtotal / 100;
      const totalAmount = subtotal + taxAmount - (updateData.discount_amount ?? invoice.discount_amount);

      updateData['subtotal'] = subtotal;
      updateData['tax_amount'] = taxAmount;
      updateData['total_amount'] = totalAmount;

      // Create new items
      const invoiceItems = items.map(item => {
        const totalPrice = calcLineTotal(item);
        return this.invoiceItemRepository.create({
          ...item,
          unit: item.unit || 'ea',
          total_price: totalPrice,
          invoice,
        });
      });

      await this.invoiceItemRepository.save(invoiceItems);

      if (invoice.document_type === 'receipt' && parent_invoice_id) {
        const parent = await this.invoiceRepository.findOne({ where: { id: parent_invoice_id } });
        if (parent) {
          const balanceDue = this.getBalanceDue(parent) + parseFloat(String(invoice.total_amount || 0));
          if (totalAmount > balanceDue + 0.01) {
            throw new BadRequestException(`Payment amount exceeds balance due`);
          }
        }
      }
    }

    await this.invoiceRepository.update(id, updateData);

    if (invoice.document_type === 'receipt') {
      const parentId = parent_invoice_id ?? oldParentId ?? invoice.parent_invoice_id;
      if (parentId) await this.syncParentInvoicePayments(parentId);
      if (oldParentId && oldParentId !== parentId) await this.syncParentInvoicePayments(oldParentId);
    }

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
    const invoice = await this.invoiceRepository.findOne({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    
    if (invoice.status === InvoiceStatus.PAID && invoice.document_type !== 'receipt') {
      throw new BadRequestException('Cannot delete a paid invoice');
    }

    const parentId = invoice.parent_invoice_id;
    await this.invoiceRepository.remove(invoice);

    if (invoice.document_type === 'receipt' && parentId) {
      await this.syncParentInvoicePayments(parentId);
    }
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

  private async generateInvoiceNumber(type: 'invoice' | 'quotation' | 'receipt' = 'invoice'): Promise<string> {
    const prefix = type === 'quotation' ? 'QUO' : type === 'receipt' ? 'REC' : 'INV';
    const result = await this.invoiceRepository
      .createQueryBuilder('inv')
      .select('COUNT(inv.id)', 'count')
      .where('inv.document_type = :type', { type })
      .getRawOne();
    const nextNumber = (parseInt(String(result?.count || 0), 10) || 0) + 1;
    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
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
      project_id: originalInvoice.project_id,
      document_type: originalInvoice.document_type || 'invoice',
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