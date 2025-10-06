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
import { User } from '../../users/entities/user.entity';
import { Milestone } from './milestone.entity';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ProjectType {
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  API = 'api',
  CONSULTING = 'consulting',
  MAINTENANCE = 'maintenance',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'text',
    default: 'website'
  })
  type: string;

  @Column({
    type: 'text',
    default: 'planning',
  })
  status: ProjectStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column('date', { nullable: true })
  startDate: Date;

  @Column('date', { nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  estimatedHours: number;

  @Column({ default: 0 })
  actualHours: number;

  @Column({ default: 0 })
  completionPercentage: number;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}