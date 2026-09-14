import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { InsightComment } from './insight-comment.entity';

@Entity('insight_votes')
@Unique(['commentId', 'voterKey'])
export class InsightVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
  }

  @Index()
  @Column()
  commentId: string;

  @ManyToOne(() => InsightComment, (comment) => comment.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: InsightComment;

  @Column({ nullable: true })
  userId: string;

  @Column()
  voterKey: string;

  @Column({ type: 'int' })
  value: number;

  @CreateDateColumn()
  createdAt: Date;
}
