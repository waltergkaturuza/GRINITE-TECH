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
import { Project } from './project.entity';
import { Module } from './module.entity';

export enum MilestoneStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: MilestoneStatus,
    default: MilestoneStatus.NOT_STARTED,
  })
  status: MilestoneStatus;

  @Column({ default: 0 })
  orderIndex: number;

  @Column({ default: 0 })
  progress: number; // 0-100

  @Column('date', { nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  estimatedHours: number;

  @Column({ default: 0 })
  actualHours: number;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Module, (module) => module.milestone)
  modules: Module[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
