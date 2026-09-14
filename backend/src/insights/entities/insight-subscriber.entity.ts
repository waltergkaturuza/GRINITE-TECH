import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';

export enum InsightSubscriberStatus {
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed',
}

@Entity('insight_subscribers')
export class InsightSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
    if (!this.unsubscribeToken) this.unsubscribeToken = randomUUID();
  }

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', default: InsightSubscriberStatus.ACTIVE })
  status: string;

  @Index({ unique: true })
  @Column()
  unsubscribeToken: string;

  @Column({ nullable: true })
  unsubscribedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
