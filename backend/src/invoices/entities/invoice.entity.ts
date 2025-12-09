import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Generated } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum PaymentTerms {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  DUE_ON_RECEIPT = 'due_on_receipt'
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Generated('increment')
  invoice_number: string;

  @ManyToOne(() => User, { eager: true })
  client: User;

  @Column()
  client_id: string;

  @Column()
  issue_date: Date;

  @Column()
  due_date: Date;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: PaymentTerms,
    default: PaymentTerms.NET_30
  })
  payment_terms: PaymentTerms;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  tax_rate: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column('text', { nullable: true })
  terms_conditions: string;

  @Column({ nullable: true })
  payment_date: Date;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  payment_reference: string;

  // Client billing information
  @Column('text', { nullable: true })
  billing_address: string;

  @Column({ nullable: true })
  billing_email: string;

  @Column({ nullable: true })
  billing_phone: string;

  // Company information for invoice header
  @Column({ default: 'Quantis Technologies' })
  company_name: string;

  @Column('text', { nullable: true })
  company_address: string;

  @Column({ nullable: true })
  company_email: string;

  @Column({ nullable: true })
  company_phone: string;

  @Column({ nullable: true })
  company_website: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => InvoiceItem, item => item.invoice, { cascade: true, eager: true })
  items: InvoiceItem[];
}

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Invoice, invoice => invoice.items, { onDelete: 'CASCADE' })
  invoice: Invoice;

  @Column()
  description: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @Column({ nullable: true })
  tax_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}