import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatSession } from '../chatbot/entities/chat-session.entity'

export interface ChatSessionData {
  id: string
  sessionId: string
  userId?: string
  sessionName?: string
  messages: any[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackData {
  id: string
  messageId: string
  sessionId?: string
  userId?: string
  rating: number
  comment?: string
  metadata?: Record<string, any>
  createdAt: Date
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly chatSessionsRepo: Repository<ChatSession>,
  ) {}

  private toDto(entity: ChatSession): ChatSessionData {
    let messages: any[] = []
    try {
      messages = entity.messages ? JSON.parse(entity.messages) : []
    } catch {
      messages = []
    }
    let metadata: Record<string, any> | undefined
    try {
      metadata = entity.context ? JSON.parse(entity.context) : undefined
    } catch {
      metadata = undefined
    }
    return {
      id: entity.id,
      sessionId: entity.sessionId,
      userId: entity.user?.id,
      sessionName: entity.sessionId,
      messages,
      metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  async createSession(data: any): Promise<ChatSessionData> {
    const sessionId = data.sessionId || `session_${Date.now()}`
    const messages = Array.isArray(data.messages) ? data.messages : []
    const metadata = data.metadata || {}

    let existing = await this.chatSessionsRepo.findOne({ where: { sessionId } })
    if (!existing) {
      existing = this.chatSessionsRepo.create({
        sessionId,
        messages: JSON.stringify(messages),
        context: JSON.stringify(metadata),
        isActive: true,
      })
    } else {
      existing.messages = JSON.stringify(messages)
      existing.context = JSON.stringify(metadata)
      existing.isActive = true
    }

    const saved = await this.chatSessionsRepo.save(existing)
    return this.toDto(saved)
  }

  async updateSession(sessionId: string, data: any): Promise<ChatSessionData> {
    const existing = await this.chatSessionsRepo.findOne({ where: { sessionId } })
    if (!existing) throw new NotFoundException('Chat session not found')

    if (Array.isArray(data.messages)) {
      existing.messages = JSON.stringify(data.messages)
    }
    if (data.metadata) {
      existing.context = JSON.stringify(data.metadata)
    }
    existing.isActive = data.isActive ?? existing.isActive

    const saved = await this.chatSessionsRepo.save(existing)
    return this.toDto(saved)
  }

  async addMessage(sessionId: string, message: any): Promise<ChatSessionData> {
    const existing = await this.chatSessionsRepo.findOne({ where: { sessionId } })
    if (!existing) throw new NotFoundException('Chat session not found')

    let messages: any[] = []
    try {
      messages = existing.messages ? JSON.parse(existing.messages) : []
    } catch {
      messages = []
    }
    messages.push(message)
    existing.messages = JSON.stringify(messages)

    const saved = await this.chatSessionsRepo.save(existing)
    return this.toDto(saved)
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.chatSessionsRepo.delete({ sessionId } as any)
  }

  async getSessions(userId?: string): Promise<ChatSessionData[]> {
    // Note: userId filter is best-effort (chatbot sessions may be anonymous)
    const sessions = await this.chatSessionsRepo.find({ order: { updatedAt: 'DESC' as any } })
    const dtos = sessions.map((s) => this.toDto(s))
    if (userId) return dtos.filter((s) => s.userId === userId)
    return dtos
  }

  async getSession(idOrSessionId: string): Promise<ChatSessionData | null> {
    const byId = await this.chatSessionsRepo.findOne({ where: { id: idOrSessionId } as any })
    if (byId) return this.toDto(byId)
    const bySessionId = await this.chatSessionsRepo.findOne({ where: { sessionId: idOrSessionId } })
    return bySessionId ? this.toDto(bySessionId) : null
  }

  async createFeedback(data: any): Promise<FeedbackData> {
    const feedback: FeedbackData = {
      id: `feedback_${Date.now()}`,
      messageId: data.messageId,
      sessionId: data.sessionId,
      userId: data.userId,
      rating: data.rating,
      comment: data.comment,
      metadata: data.metadata || {},
      createdAt: new Date(),
    }
    // Feedback persistence not implemented yet
    return feedback
  }

  async getFeedback(sessionId?: string, userId?: string): Promise<FeedbackData[]> {
    // Feedback persistence not implemented yet
    return []
  }

  async getAnalytics(): Promise<any> {
    const sessions = await this.getSessions()
    const totalSessions = sessions.length
    const averageSessionLength =
      sessions.reduce((sum, session) => sum + (session.messages?.length || 0), 0) / (totalSessions || 1)

    const mostActiveUsers = sessions
      .filter((s) => s.userId)
      .reduce((acc, session) => {
        const uid = session.userId as string
        acc[uid] = (acc[uid] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return {
      totalSessions,
      totalFeedback: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      satisfactionRate: 0,
      averageSessionLength,
      mostActiveUsers: Object.entries(mostActiveUsers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count })),
    }
  }
}