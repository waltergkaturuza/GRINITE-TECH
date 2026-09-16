import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceItem } from '../database/all-entities';
import { InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto, InvoiceStatsDto } from './dto/invoice.dto';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

const QUANTIS_COMPANY_DEFAULTS = {
  company_name: 'Quantis Technologies Private Limited',
  company_logo_url: '/QUANTIS-1.svg',
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

function blankToNull(value: unknown) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

function money(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function documentKind(value: unknown): string {
  return String(value || 'invoice').toLowerCase();
}

function invoiceDbError(error: unknown) {
  const driver = (error as { driverError?: { code?: string; detail?: string; message?: string } })?.driverError;
  const code = driver?.code || (error as { code?: string })?.code;
  const detail = driver?.detail || driver?.message || (error instanceof Error ? error.message : '');
  if (code === '23505') return 'That invoice number already exists. Try saving again.';
  if (code === '23503') return 'The selected client or project is invalid.';
  if (code === '22P02') return 'One of the submitted values is in the wrong format.';
  if (code === '42703') return 'Invoice storage is missing a required field. Refresh and try again.';
  return detail || 'Could not save the invoice.';
}

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {
    if (!this.invoiceRepository.metadata?.name) {
      this.logger.error('Invoice repository has no TypeORM metadata — check DataSource entity registration');
    }
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const {
      client_id, project_id, document_type = 'invoice', items,
      payment_date, payment_reference, payment_method, parent_invoice_id,
      ...invoiceData
    } = createInvoiceDto;
    const isReceipt = document_type === 'receipt';
    const projectId = blankToNull(project_id) as string | null;

    if (!items?.length) {
      throw new BadRequestException('Add at least one line item before saving');
    }

    const client = await this.userRepository.findOne({ where: { id: client_id } });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (projectId) {
      const project = await this.projectRepository.findOne({ where: { id: projectId } });
      if (!project) {
        throw new BadRequestException('Selected project was not found');
      }
    }

    let parentInvoice: Invoice | null = null;
    if (isReceipt && parent_invoice_id) {
      parentInvoice = await this.invoiceRepository.findOne({
        where: { id: parent_invoice_id },
      });
      if (!parentInvoice) {
        throw new NotFoundException('Linked invoice not found');
      }
      if (documentKind(parentInvoice.document_type) === 'receipt') {
        throw new BadRequestException('Receipts can only be linked to an invoice');
      }
    }

    const calcLineTotal = (item: { quantity: number; unit_price: number; discount_percent?: number }) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const discountPct = Number(item.discount_percent) || 0;
      return qty * price * (1 - discountPct / 100);
    };

    const subtotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);
    // Linked receipts inherit the invoice VAT rate (including 0%) and record cash received as-is.
    let taxRate = money(invoiceData.tax_rate);
    if (isReceipt && parentInvoice) {
      taxRate = money(parentInvoice.tax_rate);
    }
    const isLinkedReceipt = Boolean(isReceipt && parentInvoice);
    const taxAmount = isLinkedReceipt ? 0 : (taxRate * subtotal) / 100;
    const totalAmount = subtotal + taxAmount - money(invoiceData.discount_amount);

    if (isReceipt && parentInvoice) {
      const balanceDue = money(parentInvoice.total_amount) - money(parentInvoice.amount_paid);
      if (totalAmount > balanceDue + 0.01) {
        throw new BadRequestException(`Payment amount (${totalAmount}) exceeds balance due (${balanceDue.toFixed(2)})`);
      }
    }

    const sanitizedData = {
      billing_period_start: blankToNull(invoiceData.billing_period_start),
      billing_period_end: blankToNull(invoiceData.billing_period_end),
      purchase_order: blankToNull(invoiceData.purchase_order),
    };

    try {
      const invoiceNumber = await this.generateInvoiceNumber(document_type);
      const issueDate = new Date(invoiceData.issue_date);
      const dueDate = new Date(invoiceData.due_date);
      const receiptPaymentDate = isReceipt ? (payment_date ? new Date(payment_date) : issueDate) : null;
      const coreColumns = `invoice_number, client_id, issue_date, due_date, status, payment_terms,
            subtotal, tax_rate, tax_amount, discount_amount, total_amount,
            notes, terms_conditions, billing_address, billing_email, billing_phone`;
      const coreValues = [
        invoiceNumber,
        client_id,
        issueDate,
        dueDate,
        isReceipt ? 'paid' : 'draft',
        invoiceData.payment_terms || 'net_30',
        subtotal,
        taxRate,
        taxAmount,
        money(invoiceData.discount_amount),
        totalAmount,
        invoiceData.notes || null,
        invoiceData.terms_conditions || null,
        invoiceData.billing_address || null,
        invoiceData.billing_email || null,
        invoiceData.billing_phone || null,
      ];

      let savedId = 0;
      try {
        const insertedRows: Array<{ id: number }> = await this.invoiceRepository.query(
          `INSERT INTO invoices (
              ${coreColumns},
              document_type, parent_invoice_id, amount_paid,
              payment_date, payment_method, payment_reference
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
            RETURNING id`,
          [
            ...coreValues,
            document_type || 'invoice',
            isReceipt ? parent_invoice_id || null : null,
            isReceipt ? totalAmount : 0,
            receiptPaymentDate,
            isReceipt ? payment_method || 'Receipt' : null,
            isReceipt ? payment_reference || parentInvoice?.invoice_number || null : null,
          ],
        );
        savedId = Number(insertedRows?.[0]?.id);
      } catch (insertError) {
        this.logger.warn(`Extended invoice insert failed, retrying core columns: ${invoiceDbError(insertError)}`);
        const insertedRows: Array<{ id: number }> = await this.invoiceRepository.query(
          `INSERT INTO invoices (${coreColumns})
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
           RETURNING id`,
          coreValues,
        );
        savedId = Number(insertedRows?.[0]?.id);
      }
      if (!savedId) {
        throw new BadRequestException('Invoice was not saved');
      }

      const extras: Record<string, unknown> = {
        project_id: projectId,
        document_type: document_type || 'invoice',
        tax_rate: taxRate,
        amount_paid: isReceipt ? totalAmount : 0,
        parent_invoice_id: isReceipt ? parent_invoice_id || null : null,
        payment_date: receiptPaymentDate,
        payment_method: isReceipt ? payment_method || 'Receipt' : null,
        payment_reference: isReceipt ? payment_reference || parentInvoice?.invoice_number || null : null,
        billing_period_start: sanitizedData.billing_period_start
          ? new Date(String(sanitizedData.billing_period_start))
          : null,
        billing_period_end: sanitizedData.billing_period_end
          ? new Date(String(sanitizedData.billing_period_end))
          : null,
        purchase_order: sanitizedData.purchase_order,
        company_name: invoiceData.company_name || QUANTIS_COMPANY_DEFAULTS.company_name,
        company_logo_url: invoiceData.company_logo_url || QUANTIS_COMPANY_DEFAULTS.company_logo_url,
        company_address: invoiceData.company_address || QUANTIS_COMPANY_DEFAULTS.company_address,
        company_email: invoiceData.company_email || QUANTIS_COMPANY_DEFAULTS.company_email,
        company_phone: invoiceData.company_phone || QUANTIS_COMPANY_DEFAULTS.company_phone,
        company_website: invoiceData.company_website || QUANTIS_COMPANY_DEFAULTS.company_website,
        company_bank_name: invoiceData.company_bank_name || QUANTIS_COMPANY_DEFAULTS.company_bank_name,
        company_bank_branch: invoiceData.company_bank_branch || QUANTIS_COMPANY_DEFAULTS.company_bank_branch,
        company_account_name: invoiceData.company_account_name || QUANTIS_COMPANY_DEFAULTS.company_account_name,
        company_usd_account: invoiceData.company_usd_account || QUANTIS_COMPANY_DEFAULTS.company_usd_account,
        company_zig_account: invoiceData.company_zig_account || QUANTIS_COMPANY_DEFAULTS.company_zig_account,
        company_code: invoiceData.company_code || null,
        company_vat_code: invoiceData.company_vat_code || null,
        company_swift: invoiceData.company_swift || null,
        company_iban: invoiceData.company_iban || null,
        buyer_company_code: invoiceData.buyer_company_code || null,
        buyer_vat_code: invoiceData.buyer_vat_code || null,
        buyer_bank_name: invoiceData.buyer_bank_name || null,
        buyer_swift: invoiceData.buyer_swift || null,
        buyer_iban: invoiceData.buyer_iban || null,
      };

      for (const [key, value] of Object.entries(extras)) {
        try {
          await this.invoiceRepository.query(
            `UPDATE invoices SET "${key}" = $1 WHERE id = $2`,
            [value, savedId],
          );
        } catch {
          // Column may not exist in this database yet.
        }
      }

      for (const item of items) {
        const totalPrice = calcLineTotal(item);
        const quantity = Number(item.quantity) || 1;
        const unitPrice = Number(item.unit_price) || 0;
        try {
          await this.invoiceRepository.query(
            `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price, unit, tax_rate, discount_percent)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              savedId,
              item.description,
              quantity,
              unitPrice,
              totalPrice,
              item.unit || 'ea',
              item.tax_rate ?? null,
              Number(item.discount_percent) || 0,
            ],
          );
        } catch {
          await this.invoiceRepository.query(
            `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price)
             VALUES ($1,$2,$3,$4,$5)`,
            [savedId, item.description, Math.max(1, Math.round(quantity)), unitPrice, totalPrice],
          );
        }
      }

      if (isReceipt && parent_invoice_id) {
        await this.syncParentInvoicePayments(parent_invoice_id);
      }

      try {
        const withItems = await this.invoiceRepository.findOne({
          where: { id: savedId },
          relations: ['items', 'client', 'project'],
        });
        if (withItems) return withItems;
      } catch (loadError) {
        this.logger.warn(`Invoice ${savedId} saved but could not be reloaded: ${invoiceDbError(loadError)}`);
      }

      return {
        id: savedId,
        invoice_number: invoiceNumber,
        client_id,
        total_amount: totalAmount,
      } as Invoice;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      this.logger.error('Failed to create invoice', error instanceof Error ? error.stack : error);
      throw new BadRequestException(invoiceDbError(error));
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: InvoiceStatus,
    clientId?: string,
    documentType?: string,
    search?: string,
    projectId?: string,
  ): Promise<{ invoices: Invoice[]; total: number }> {
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
    if (projectId) qb.andWhere('invoice.project_id = :projectId', { projectId });
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

    if (documentKind(invoice.document_type) !== 'receipt' && documentKind(invoice.document_type) !== 'quotation') {
      const receipts = await this.invoiceRepository.find({
        where: { parent_invoice_id: id, document_type: 'receipt' },
        order: { created_at: 'ASC' },
      });
      return { ...invoice, receipts, balance_due: this.getBalanceDue(invoice) };
    }

    return invoice;
  }

  async getOpenInvoices(): Promise<any[]> {
    const invoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.client', 'client')
      .where('(invoice.document_type = :type OR invoice.document_type IS NULL)', { type: 'invoice' })
      .andWhere('LOWER(invoice.status) NOT IN (:...closed)', { closed: ['paid', 'cancelled'] })
      .orderBy('invoice.created_at', 'DESC')
      .getMany();

    return invoices
      .map((inv) => ({ ...inv, balance_due: this.getBalanceDue(inv) }))
      .filter((inv) => Number(inv.balance_due) > 0.01);
  }

  async getInvoiceReceipts(id: number): Promise<Invoice[]> {
    await this.findOne(id);
    return this.invoiceRepository.find({
      where: { parent_invoice_id: id, document_type: 'receipt' },
      order: { created_at: 'ASC' },
    });
  }

  private getBalanceDue(invoice: Invoice): number {
    const total = money(invoice.total_amount);
    const paid = money(invoice.amount_paid);
    return Math.max(0, total - paid);
  }

  private async syncParentInvoicePayments(parentInvoiceId: number): Promise<void> {
    const parents = await this.invoiceRepository.query(
      `SELECT id, total_amount, status, document_type, payment_date
       FROM invoices WHERE id = $1`,
      [parentInvoiceId],
    );
    const parent = parents?.[0];
    if (!parent) return;
    if (documentKind(parent.document_type) === 'receipt' || documentKind(parent.document_type) === 'quotation') {
      return;
    }

    const paidRows = await this.invoiceRepository.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS paid
       FROM invoices
       WHERE parent_invoice_id = $1
         AND LOWER(COALESCE(document_type, 'receipt')) = 'receipt'
         AND LOWER(COALESCE(status, '')) <> 'cancelled'`,
      [parentInvoiceId],
    );
    const amountPaid = money(paidRows?.[0]?.paid);
    const total = money(parent.total_amount);
    const currentStatus = String(parent.status || '').toLowerCase();
    if (currentStatus === 'cancelled') return;

    let status = currentStatus || InvoiceStatus.SENT;
    if (total > 0 && amountPaid >= total - 0.01) {
      status = InvoiceStatus.PAID;
    } else if (amountPaid > 0.01) {
      status = InvoiceStatus.PARTIALLY_PAID;
    } else if (currentStatus === InvoiceStatus.PAID || currentStatus === InvoiceStatus.PARTIALLY_PAID) {
      status = InvoiceStatus.SENT;
    }

    const paymentDate = status === InvoiceStatus.PAID ? new Date() : parent.payment_date || null;

    try {
      await this.invoiceRepository.query(
        `UPDATE invoices SET amount_paid = $1, status = $2, payment_date = $3 WHERE id = $4`,
        [amountPaid, status, paymentDate, parentInvoiceId],
      );
    } catch (error) {
      this.logger.warn(`Could not sync amount_paid/status together: ${invoiceDbError(error)}`);
      try {
        await this.invoiceRepository.query(`UPDATE invoices SET status = $1 WHERE id = $2`, [status, parentInvoiceId]);
      } catch (statusError) {
        this.logger.error(`Could not update invoice status: ${invoiceDbError(statusError)}`);
        throw new BadRequestException('Receipt saved but the invoice status could not be updated.');
      }
      try {
        await this.invoiceRepository.query(
          `UPDATE invoices SET amount_paid = $1 WHERE id = $2`,
          [amountPaid, parentInvoiceId],
        );
      } catch (paidError) {
        this.logger.warn(`Could not update amount_paid: ${invoiceDbError(paidError)}`);
      }
    }
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

      const linkedParentId = parent_invoice_id ?? invoice.parent_invoice_id;
      const isLinkedReceipt = documentKind(invoice.document_type) === 'receipt' && !!linkedParentId;
      let taxRate = money(updateData.tax_rate ?? invoice.tax_rate);
      if (isLinkedReceipt) {
        const parent = await this.invoiceRepository.findOne({ where: { id: linkedParentId } });
        if (parent) {
          taxRate = money(parent.tax_rate);
          const balanceDue = this.getBalanceDue(parent) + money(invoice.total_amount);
          const proposedTotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);
          if (proposedTotal > balanceDue + 0.01) {
            throw new BadRequestException('Payment amount exceeds balance due');
          }
        }
      }

      const subtotal = items.reduce((sum, item) => sum + calcLineTotal(item), 0);
      const taxAmount = isLinkedReceipt ? 0 : (taxRate * subtotal) / 100;
      const totalAmount = subtotal + taxAmount - money(updateData.discount_amount ?? invoice.discount_amount);

      updateData['subtotal'] = subtotal;
      updateData['tax_rate'] = taxRate;
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
    const empty: InvoiceStatsDto = {
      total_invoices: 0,
      total_revenue: 0,
      paid_invoices: 0,
      pending_invoices: 0,
      draft_invoices: 0,
      overdue_invoices: 0,
      monthly_revenue: 0,
      monthly_growth: 0,
    }

    try {
      const totalInvoices = await this.invoiceRepository.count();

      const totalRevenueResult = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(invoice.total_amount), 0)', 'total')
        .where('invoice.status = :status', { status: InvoiceStatus.PAID })
        .getRawOne();

      const paidInvoices = await this.invoiceRepository.count({ where: { status: InvoiceStatus.PAID } });
      const pendingInvoices = await this.invoiceRepository.count({ where: { status: InvoiceStatus.SENT } });
      const draftInvoices = await this.invoiceRepository.count({ where: { status: InvoiceStatus.DRAFT } });
      const overdueInvoices = await this.invoiceRepository.count({
        where: {
          status: InvoiceStatus.SENT,
          due_date: Between(new Date('1900-01-01'), new Date()),
        },
      });

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const monthlyRevenueResult = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(invoice.total_amount), 0)', 'monthly')
        .where('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.payment_date BETWEEN :start AND :end', {
          start: startOfMonth,
          end: endOfMonth,
        })
        .getRawOne();

      const startOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const endOfPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

      const prevMonthRevenueResult = await this.invoiceRepository
        .createQueryBuilder('invoice')
        .select('COALESCE(SUM(invoice.total_amount), 0)', 'previous')
        .where('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.payment_date BETWEEN :start AND :end', {
          start: startOfPrevMonth,
          end: endOfPrevMonth,
        })
        .getRawOne();

      const totalRevenue = parseFloat(String(totalRevenueResult?.total ?? '0')) || 0;
      const monthlyRevenue = parseFloat(String(monthlyRevenueResult?.monthly ?? '0')) || 0;
      const prevMonthRevenue = parseFloat(String(prevMonthRevenueResult?.previous ?? '0')) || 0;

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
    } catch (error) {
      this.logger.error('Failed to load invoice stats', error instanceof Error ? error.stack : error);
      return empty;
    }
  }

  private async generateInvoiceNumber(type: 'invoice' | 'quotation' | 'receipt' = 'invoice'): Promise<string> {
    const prefix = type === 'quotation' ? 'QUO' : type === 'receipt' ? 'REC' : 'INV';
    try {
      const rows = await this.invoiceRepository
        .createQueryBuilder('inv')
        .select('inv.invoice_number', 'invoice_number')
        .where('inv.invoice_number LIKE :prefix', { prefix: `${prefix}-%` })
        .getRawMany();

      let max = 0;
      for (const row of rows) {
        const n = parseInt(String(row.invoice_number || '').split('-').pop() || '0', 10);
        if (Number.isFinite(n) && n > max) max = n;
      }
      return `${prefix}-${String(max + 1).padStart(3, '0')}`;
    } catch (error) {
      this.logger.warn(`Could not derive next ${prefix} number: ${invoiceDbError(error)}`);
      return `${prefix}-${Date.now().toString().slice(-6)}`;
    }
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
    const toNumber = (value: unknown, fallback = 0) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };

    const duplicateData = {
      client_id: originalInvoice.client_id,
      project_id: originalInvoice.project_id,
      document_type: originalInvoice.document_type || 'invoice',
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      payment_terms: originalInvoice.payment_terms,
      tax_rate: toNumber(originalInvoice.tax_rate),
      discount_amount: toNumber(originalInvoice.discount_amount),
      notes: originalInvoice.notes,
      terms_conditions: originalInvoice.terms_conditions,
      billing_address: originalInvoice.billing_address,
      billing_email: originalInvoice.billing_email,
      billing_phone: originalInvoice.billing_phone,
      billing_period_start: originalInvoice.billing_period_start
        ? new Date(originalInvoice.billing_period_start).toISOString()
        : undefined,
      billing_period_end: originalInvoice.billing_period_end
        ? new Date(originalInvoice.billing_period_end).toISOString()
        : undefined,
      purchase_order: originalInvoice.purchase_order,
      items: (originalInvoice.items || []).map((item: any) => ({
        description: item.description,
        quantity: toNumber(item.quantity, 1) || 1,
        unit_price: toNumber(item.unit_price),
        tax_rate: toNumber(item.tax_rate),
        unit: item.unit || 'ea',
        discount_percent: toNumber(item.discount_percent),
      })),
    };

    const created = await this.create(duplicateData as CreateInvoiceDto);
    return this.findOne(created.id);
  }
}