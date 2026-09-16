import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

export const COMPANY_DOCUMENT_CATEGORIES = [
  'certificates',
  'bids',
  'contracts',
  'licenses',
  'insurance',
  'policies',
  'financial',
  'hr',
  'legal',
  'correspondence',
  'other',
] as const;

export const PROJECT_DOCUMENT_CATEGORIES = [
  'specs',
  'designs',
  'deliverables',
  'contracts',
  'correspondence',
  'other',
] as const;

export type CompanyDocumentCategory =
  | (typeof COMPANY_DOCUMENT_CATEGORIES)[number]
  | (typeof PROJECT_DOCUMENT_CATEGORIES)[number];

@Entity('company_documents')
@Index(['scope', 'category'])
@Index(['projectId'])
@Index('idx_company_documents_project_url', ['projectId', 'url'], { unique: true })
export class CompanyDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column({ default: 'other' })
  category: string;

  @Column({ default: 'company' })
  scope: 'company' | 'project';

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'projectId' })
  project: Project | null;

  @Column({ type: 'uuid', nullable: true })
  projectId: string | null;

  @Column('text')
  url: string;

  @Column('text')
  pathname: string;

  @Column()
  originalName: string;

  @Column({ type: 'int', default: 0 })
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User | null;

  @Column({ nullable: true })
  uploadedById: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
