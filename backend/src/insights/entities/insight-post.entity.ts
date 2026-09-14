import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { InsightComment } from './insight-comment.entity';

export enum InsightKind {
  ARTICLE = 'article',
  QUESTION = 'question',
}

export enum InsightCategory {
  NEWS = 'news',
  PROMOTIONS = 'promotions',
  PRODUCTS = 'products',
  TECHNOLOGY = 'technology',
  RESEARCH = 'research',
  COMMUNITY = 'community',
}

export enum InsightStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('insight_posts')
export class InsightPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @BeforeInsert()
  assignId() {
    if (!this.id) this.id = randomUUID();
  }

  @Index({ unique: true })
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  excerpt: string;

  @Column('text')
  body: string;

  @Column({ type: 'text', default: InsightKind.ARTICLE })
  kind: string;

  @Column({ type: 'text', default: InsightCategory.NEWS })
  category: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column('text', { nullable: true })
  tags: string;

  @Column({ type: 'text', default: InsightStatus.DRAFT })
  status: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ default: 'Quantis Technologies' })
  authorName: string;

  @Column({ nullable: true })
  authorEmail: string;

  @Column({ nullable: true })
  authorUserId: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  commentCount: number;

  @Column({ nullable: true })
  publishedAt: Date;

  @OneToMany(() => InsightComment, (comment) => comment.post)
  comments: InsightComment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
