import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Module } from './module.entity';

export enum FeatureStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum FeaturePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FeatureStatus,
    default: FeatureStatus.NOT_STARTED,
  })
  status: FeatureStatus;

  @Column({
    type: 'enum',
    enum: FeaturePriority,
    default: FeaturePriority.MEDIUM,
  })
  priority: FeaturePriority;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ nullable: true })
  estimatedHours: number;

  @Column({ default: 0 })
  actualHours: number;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => Module, (module) => module.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
