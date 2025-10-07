import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('project_types')
export class ProjectType {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  value: string

  @Column()
  label: string

  @Column()
  category: string

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  icon: string

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isCustom: boolean

  @Column({ default: 0 })
  orderIndex: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}