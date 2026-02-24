import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RequestStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('project_requests')
export class ProjectRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  trackingId: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  serviceInterested: string;

  @Column()
  projectBudget: string;

  @Column()
  projectTimeline: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({
    type: 'enum',
    enum: RequestPriority,
    default: RequestPriority.MEDIUM,
  })
  priority: RequestPriority;

  @Column({ nullable: true })
  estimatedBudget: number;

  @Column({ nullable: true })
  estimatedHours: number;

  @Column({ nullable: true })
  estimatedStartDate: Date;

  @Column({ nullable: true })
  estimatedEndDate: Date;

  @Column('text', { nullable: true })
  adminNotes: string;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User;

  @OneToMany(() => RequestDocument, document => document.request)
  documents: RequestDocument[];

  @OneToMany(() => RequestMessage, message => message.request)
  messages: RequestMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('request_documents')
export class RequestDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProjectRequest, request => request.documents)
  request: ProjectRequest;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  uploadedAt: Date;
}

@Entity('request_messages')
export class RequestMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProjectRequest, request => request.messages)
  request: ProjectRequest;

  @ManyToOne(() => User, { nullable: true })
  sender: User;

  @Column()
  senderName: string;

  @Column()
  senderEmail: string;

  @Column()
  senderType: 'client' | 'admin' | 'system';

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isInternal: boolean; // For admin-only notes

  @OneToMany(() => MessageAttachment, attachment => attachment.message)
  attachments: MessageAttachment[];

  @CreateDateColumn()
  sentAt: Date;
}

@Entity('message_attachments')
export class MessageAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => RequestMessage, message => message.attachments)
  message: RequestMessage;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @CreateDateColumn()
  uploadedAt: Date;
}