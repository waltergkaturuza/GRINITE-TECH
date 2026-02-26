import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LedgerAccount } from './ledger-account.entity';

export enum LedgerEntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum LedgerReferenceType {
  MANUAL = 'manual',
  HOSTING_EXPENSE = 'hosting_expense',
  INVOICE_PAYMENT = 'invoice_payment',
  ADJUSTMENT = 'adjustment',
}

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LedgerAccount, (account) => account.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: LedgerAccount;

  @Column()
  accountId: string;

  @Column('date')
  entryDate: Date;

  @Column({
    type: 'text',
  })
  type: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  referenceType: string;

  @Column({ nullable: true })
  referenceId: string;

  @CreateDateColumn()
  createdAt: Date;
}
