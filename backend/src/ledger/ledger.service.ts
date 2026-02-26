import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerAccount } from './entities/ledger-account.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { CreateLedgerAccountDto } from './dto/create-ledger-account.dto';
import { UpdateLedgerAccountDto } from './dto/update-ledger-account.dto';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { UpdateLedgerEntryDto } from './dto/update-ledger-entry.dto';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerAccount)
    private accountRepository: Repository<LedgerAccount>,
    @InjectRepository(LedgerEntry)
    private entryRepository: Repository<LedgerEntry>,
  ) {}

  // --- Accounts ---
  async createAccount(dto: CreateLedgerAccountDto): Promise<LedgerAccount> {
    const account = this.accountRepository.create({
      name: dto.name,
      type: dto.type || 'other',
      currency: dto.currency || 'USD',
      openingBalance: dto.openingBalance ?? 0,
      description: dto.description,
    });
    return this.accountRepository.save(account);
  }

  async findAllAccounts(): Promise<LedgerAccount[]> {
    return this.accountRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOneAccount(id: string): Promise<LedgerAccount> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) throw new NotFoundException('Account not found');
    return account;
  }

  async updateAccount(id: string, dto: UpdateLedgerAccountDto): Promise<LedgerAccount> {
    await this.findOneAccount(id);
    await this.accountRepository.update(id, dto as Partial<LedgerAccount>);
    return this.findOneAccount(id);
  }

  async removeAccount(id: string): Promise<void> {
    await this.findOneAccount(id);
    await this.accountRepository.update(id, { isActive: false });
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const account = await this.findOneAccount(accountId);
    const entries = await this.entryRepository.find({
      where: { accountId },
      order: { entryDate: 'ASC', createdAt: 'ASC' },
    });
    let balance = Number(account.openingBalance || 0);
    for (const e of entries) {
      const amt = Number(e.amount || 0);
      if (e.type === 'debit') balance += amt;
      else balance -= amt;
    }
    return balance;
  }

  async getAccountsWithBalances(): Promise<{ account: LedgerAccount; balance: number }[]> {
    const accounts = await this.findAllAccounts();
    const result: { account: LedgerAccount; balance: number }[] = [];
    for (const account of accounts) {
      const balance = await this.getAccountBalance(account.id);
      result.push({ account, balance });
    }
    return result;
  }

  // --- Entries ---
  async createEntry(dto: CreateLedgerEntryDto): Promise<LedgerEntry> {
    await this.findOneAccount(dto.accountId);
    const entry = this.entryRepository.create({
      accountId: dto.accountId,
      entryDate: new Date(dto.entryDate),
      type: dto.type,
      amount: dto.amount,
      description: dto.description,
      referenceType: dto.referenceType || 'manual',
      referenceId: dto.referenceId,
    });
    return this.entryRepository.save(entry);
  }

  async findEntriesByAccount(
    accountId: string,
    params: { limit?: number; offset?: number } = {},
  ): Promise<{ entries: LedgerEntry[]; total: number }> {
    await this.findOneAccount(accountId);
    const { limit = 100, offset = 0 } = params;
    const [entries, total] = await this.entryRepository.findAndCount({
      where: { accountId },
      order: { entryDate: 'DESC', createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
    return { entries, total };
  }

  async findOneEntry(id: string): Promise<LedgerEntry> {
    const entry = await this.entryRepository.findOne({
      where: { id },
      relations: ['account'],
    });
    if (!entry) throw new NotFoundException('Entry not found');
    return entry;
  }

  async updateEntry(id: string, dto: UpdateLedgerEntryDto): Promise<LedgerEntry> {
    await this.findOneEntry(id);
    const updateData: Partial<LedgerEntry> = {};
    if (dto.entryDate) updateData.entryDate = new Date(dto.entryDate);
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (Object.keys(updateData).length) {
      await this.entryRepository.update(id, updateData);
    }
    return this.findOneEntry(id);
  }

  async removeEntry(id: string): Promise<void> {
    await this.findOneEntry(id);
    await this.entryRepository.delete(id);
  }
}
