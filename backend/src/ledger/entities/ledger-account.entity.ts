import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

export enum LedgerAccountType {
  BANK = 'bank',
  PETTY_CASH = 'petty_cash',
  RECEIVABLES = 'receivables',
  PAYABLES = 'payables',
  OTHER = 'other',
}

@Entity('ledger_accounts')
export class LedgerAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'text',
    default: LedgerAccountType.OTHER,
  })
  type: string;

  @Column({ default: 'USD' })
  currency: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  openingBalance: number;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => LedgerEntry, (entry) => entry.account)
  entries: LedgerEntry[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
