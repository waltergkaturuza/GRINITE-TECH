import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { InsightPost } from './insight-post.entity';
import { InsightVote } from './insight-vote.entity';

export enum InsightCommentStatus {
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
}

@Entity('insight_comments')
export class InsightComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
  }

  @Index()
  @Column()
  postId: string;

  @ManyToOne(() => InsightPost, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: InsightPost;

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => InsightComment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: InsightComment;

  @OneToMany(() => InsightComment, (comment) => comment.parent)
  replies: InsightComment[];

  @Column('text')
  body: string;

  @Column()
  authorName: string;

  @Column({ nullable: true })
  authorEmail: string;

  @Column({ nullable: true })
  authorUserId: string;

  @Column({ type: 'int', default: 0 })
  voteScore: number;

  @Column({ default: false })
  accepted: boolean;

  @Column({ type: 'text', default: InsightCommentStatus.PUBLISHED })
  status: string;

  @OneToMany(() => InsightVote, (vote) => vote.comment)
  votes: InsightVote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
