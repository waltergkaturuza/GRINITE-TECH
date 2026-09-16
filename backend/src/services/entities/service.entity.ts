import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('catalog_services')
export class CatalogService {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column('text')
  description: string

  @Column()
  category: string

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number

  @Column('simple-json', { nullable: true })
  features: string[]

  @Column({ nullable: true })
  icon: string

  @Column({ type: 'text', default: 'active' })
  status: 'active' | 'inactive' | 'draft'

  @Column({ nullable: true })
  duration: string

  @Column({ default: 'USD' })
  currency: string

  @Column('simple-json', { nullable: true })
  keyBenefits: string[]

  @Column('simple-json', { nullable: true })
  targetMarket: string[]

  @Column('simple-json', { nullable: true })
  deliverables: string[]

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  setupFee: number

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  monthlyFee: number

  @Column({ type: 'int', default: 0 })
  displayOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

export type Service = CatalogService

export interface CreateServiceDto {
  title: string
  description: string
  category: string
  price: number
  features?: string[]
  icon?: string
  status?: 'active' | 'inactive' | 'draft'
  duration?: string
  currency?: string
  keyBenefits?: string[]
  targetMarket?: string[]
  deliverables?: string[]
  setupFee?: number
  monthlyFee?: number
  displayOrder?: number
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  id?: string
}
