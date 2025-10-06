import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Milestone } from './milestone.entity';
import { Feature } from './feature.entity';

export enum ModuleStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ModuleStatus,
    default: ModuleStatus.NOT_STARTED,
  })
  status: ModuleStatus;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: 0 })
  progress: number; // 0-100

  @Column({ nullable: true })
  estimatedHours: number;

  @Column({ default: 0 })
  actualHours: number;

  @ManyToOne(() => Milestone, (milestone) => milestone.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'milestone_id' })
  milestone: Milestone;

  @OneToMany(() => Feature, (feature) => feature.module)
  features: Feature[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
