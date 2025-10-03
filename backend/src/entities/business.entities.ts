import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'active' })
  status: string;

  @Column('text', { nullable: true })
  features: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ default: 0 })
  delivery_days: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  order_items: OrderItem[];
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id)
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  stripe_payment_intent_id: string;

  @Column({ nullable: true })
  billing_address: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  items: OrderItem[];

  @OneToMany(() => Project, project => project.order, { nullable: true })
  projects: Project[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => Product, product => product.order_items)
  product: Product;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @CreateDateColumn()
  created_at: Date;
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  client: User;

  @ManyToOne(() => User, { nullable: true })
  assigned_to: User;

  @ManyToOne(() => Order, order => order.projects, { nullable: true })
  order: Order;

  @Column({ default: 'planning' })
  status: string; // planning, in_progress, review, completed, cancelled

  @Column({ nullable: true })
  due_date: Date;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  progress_percentage: number;

  @Column('text', { nullable: true })
  requirements: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProjectFile, file => file.project)
  files: ProjectFile[];

  @OneToMany(() => ProjectMessage, message => message.project)
  messages: ProjectMessage[];
}

@Entity('project_files')
export class ProjectFile {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, project => project.files)
  project: Project;

  @ManyToOne(() => User, user => user.id)
  uploaded_by: User;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column()
  file_path: string;

  @Column()
  file_size: number;

  @Column()
  mime_type: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  uploaded_at: Date;
}

@Entity('project_messages')
export class ProjectMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Project, project => project.messages)
  project: Project;

  @ManyToOne(() => User, user => user.id)
  sender: User;

  @Column('text')
  message: string;

  @Column({ default: 'message' })
  type: string; // message, update, milestone

  @CreateDateColumn()
  created_at: Date;
}