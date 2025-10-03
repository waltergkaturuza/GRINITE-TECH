import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  userId: string

  @Column({ nullable: true })
  sessionName: string

  @Column('text')
  messages: string

  @Column('text', { nullable: true })
  metadata: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

@Entity('chat_feedback')
export class ChatFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  messageId: string

  @Column()
  sessionId: string

  @Column({ nullable: true })
  userId: string

  @Column('int')
  rating: number

  @Column({ nullable: true })
  comment: string

  @Column('text', { nullable: true })
  metadata: string

  @CreateDateColumn()
  createdAt: Date
}