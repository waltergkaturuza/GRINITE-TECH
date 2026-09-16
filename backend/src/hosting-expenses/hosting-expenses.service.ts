import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HostingExpense } from './entities/hosting-expense.entity';
import { CreateHostingExpenseDto } from './dto/create-hosting-expense.dto';
import { UpdateHostingExpenseDto } from './dto/update-hosting-expense.dto';

@Injectable()
export class HostingExpensesService {
  constructor(
    @InjectRepository(HostingExpense)
    private hostingExpenseRepository: Repository<HostingExpense>,
  ) {}

  async create(dto: CreateHostingExpenseDto): Promise<HostingExpense> {
    const entity = this.hostingExpenseRepository.create({
      projectId: dto.projectId,
      amount: dto.amount,
      currency: dto.currency || 'USD',
      provider: dto.provider,
      billingPeriodStart: dto.billingPeriodStart ? new Date(dto.billingPeriodStart) : null,
      billingPeriodEnd: dto.billingPeriodEnd ? new Date(dto.billingPeriodEnd) : null,
      description: dto.description,
      invoiceReference: dto.invoiceReference,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
      paymentMethod: dto.paymentMethod,
      status: dto.status || 'draft',
      category: dto.category || 'hosting',
      hostingLink: dto.hostingLink,
      attachmentUrls: dto.attachmentUrls || [],
    });
    return this.hostingExpenseRepository.save(entity);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    projectId?: string;
    status?: string;
    provider?: string;
  }): Promise<{ expenses: HostingExpense[]; total: number }> {
    const { page = 1, limit = 50, projectId, status, provider } = params;
    const skip = (page - 1) * limit;

    const qb = this.hostingExpenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.project', 'project')
      .orderBy('expense.createdAt', 'DESC');

    if (projectId) {
      qb.andWhere('expense.projectId = :projectId', { projectId });
    }
    if (status) {
      qb.andWhere('expense.status = :status', { status });
    }
    if (provider) {
      qb.andWhere('expense.provider ILIKE :provider', { provider: `%${provider}%` });
    }

    const [expenses, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { expenses, total };
  }

  async findOne(id: string): Promise<HostingExpense> {
    const expense = await this.hostingExpenseRepository.findOne({
      where: { id },
      relations: ['project'],
    });
    if (!expense) {
      throw new NotFoundException('Hosting expense not found');
    }
    return expense;
  }

  async update(id: string, dto: UpdateHostingExpenseDto): Promise<HostingExpense> {
    await this.findOne(id);

    const updateData: Partial<HostingExpense> = {};
    if (dto.projectId !== undefined) updateData.projectId = dto.projectId;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.provider !== undefined) updateData.provider = dto.provider;
    if (dto.billingPeriodStart !== undefined)
      updateData.billingPeriodStart = dto.billingPeriodStart ? new Date(dto.billingPeriodStart) : null;
    if (dto.billingPeriodEnd !== undefined)
      updateData.billingPeriodEnd = dto.billingPeriodEnd ? new Date(dto.billingPeriodEnd) : null;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.invoiceReference !== undefined) updateData.invoiceReference = dto.invoiceReference;
    if (dto.paymentDate !== undefined)
      updateData.paymentDate = dto.paymentDate ? new Date(dto.paymentDate) : null;
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.hostingLink !== undefined) updateData.hostingLink = dto.hostingLink;
    if (dto.attachmentUrls !== undefined) updateData.attachmentUrls = dto.attachmentUrls;

    await this.hostingExpenseRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.hostingExpenseRepository.delete(id);
  }

  async getStats(): Promise<{
    totalAmount: number;
    totalCount: number;
    byCurrency: { currency: string; total: number }[];
    byProject: { projectId: string; projectTitle: string; total: number; currency: string }[];
    byProvider: { provider: string; total: number; currency: string }[];
    byMonth: { month: string; total: number; count: number; currency: string }[];
  }> {
    const expenses = await this.hostingExpenseRepository.find({
      relations: ['project'],
      where: { status: 'paid' },
    });

    const totalCount = expenses.length;
    const byCurrencyMap = new Map<string, number>();
    for (const e of expenses) {
      const code = String(e.currency || 'USD').toUpperCase();
      byCurrencyMap.set(code, (byCurrencyMap.get(code) || 0) + Number(e.amount || 0));
    }
    const byCurrency = Array.from(byCurrencyMap.entries()).map(([currency, total]) => ({ currency, total }));

    const totalAmount = byCurrency.length <= 1
      ? (byCurrency[0]?.total || 0)
      : 0;

    const byProjectMap = new Map<string, { projectTitle: string; total: number; currency: string }>();
    for (const e of expenses) {
      const currency = String(e.currency || 'USD').toUpperCase();
      const key = `${e.projectId || '_none'}:${currency}`;
      const title = e.project?.title || 'Unassigned';
      const current = byProjectMap.get(key) || { projectTitle: title, total: 0, currency };
      current.total += Number(e.amount || 0);
      byProjectMap.set(key, current);
    }
    const byProject = Array.from(byProjectMap.entries())
      .map(([key, { projectTitle, total, currency }]) => ({
        projectId: key.split(':')[0] === '_none' ? '' : key.split(':')[0],
        projectTitle,
        total,
        currency,
      }))
      .sort((a, b) => b.total - a.total);

    const byProviderMap = new Map<string, { provider: string; total: number; currency: string }>();
    for (const e of expenses) {
      const currency = String(e.currency || 'USD').toUpperCase();
      const provider = e.provider || 'Other';
      const key = `${provider}:${currency}`;
      const current = byProviderMap.get(key) || { provider, total: 0, currency };
      current.total += Number(e.amount || 0);
      byProviderMap.set(key, current);
    }
    const byProvider = Array.from(byProviderMap.values()).sort((a, b) => b.total - a.total);

    const byMonthMap = new Map<string, { month: string; total: number; count: number; currency: string }>();
    for (const e of expenses) {
      const currency = String(e.currency || 'USD').toUpperCase();
      const d = e.paymentDate || e.createdAt;
      const month = d ? new Date(d).toISOString().slice(0, 7) : 'unknown';
      const key = `${month}:${currency}`;
      const current = byMonthMap.get(key) || { month, total: 0, count: 0, currency };
      current.total += Number(e.amount || 0);
      current.count += 1;
      byMonthMap.set(key, current);
    }
    const byMonth = Array.from(byMonthMap.values()).sort((a, b) => a.month.localeCompare(b.month) || a.currency.localeCompare(b.currency));

    return { totalAmount, totalCount, byCurrency, byProject, byProvider, byMonth };
  }

  async getUpcomingRenewals(limit = 10): Promise<HostingExpense[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expenses = await this.hostingExpenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.project', 'project')
      .where('expense.status = :status', { status: 'paid' })
      .andWhere('expense.billingPeriodEnd >= :today', { today })
      .orderBy('expense.billingPeriodEnd', 'ASC')
      .take(limit)
      .getMany();

    return expenses;
  }
}
