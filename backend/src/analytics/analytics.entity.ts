import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('page_views')
export class PageView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventName: string;

  @Column()
  page: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}

