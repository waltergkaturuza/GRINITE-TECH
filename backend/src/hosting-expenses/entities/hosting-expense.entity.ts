import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

export enum HostingExpenseStatus {
  DRAFT = 'draft',
  PAID = 'paid',
  REIMBURSED = 'reimbursed',
  CANCELLED = 'cancelled',
}

export enum HostingExpenseCategory {
  HOSTING = 'hosting',
  DOMAIN = 'domain',
  SSL = 'ssl',
  STORAGE = 'storage',
  OTHER = 'other',
}

@Entity('hosting_expenses')
export class HostingExpense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ nullable: true })
  projectId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ nullable: true })
  provider: string;

  @Column('date', { nullable: true })
  billingPeriodStart: Date;

  @Column('date', { nullable: true })
  billingPeriodEnd: Date;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  invoiceReference: string;

  @Column('date', { nullable: true })
  paymentDate: Date;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({
    type: 'text',
    default: HostingExpenseStatus.DRAFT,
  })
  status: string;

  @Column({
    type: 'text',
    default: HostingExpenseCategory.HOSTING,
  })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
