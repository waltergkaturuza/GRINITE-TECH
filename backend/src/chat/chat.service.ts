import { Injectable } from '@nestjs/common'

export interface ChatSessionData {
  id: string
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
  private sessions: ChatSessionData[] = []
  private feedback: FeedbackData[] = []

  async createSession(data: any): Promise<ChatSessionData> {
    const session: ChatSessionData = {
      id: data.sessionId || `session_${Date.now()}`,
      userId: data.userId,
      sessionName: data.sessionName || `Chat ${new Date().toLocaleString()}`,
      messages: data.messages || [],
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.sessions.push(session)
    return session
  }

  async getSessions(userId?: string): Promise<ChatSessionData[]> {
    if (userId) {
      return this.sessions.filter(session => session.userId === userId)
    }
    return this.sessions
  }

  async getSession(id: string): Promise<ChatSessionData | null> {
    return this.sessions.find(session => session.id === id) || null
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
      createdAt: new Date()
    }

    this.feedback.push(feedback)
    return feedback
  }

  async getFeedback(sessionId?: string, userId?: string): Promise<FeedbackData[]> {
    let result = this.feedback

    if (sessionId) {
      result = result.filter(f => f.sessionId === sessionId)
    }

    if (userId) {
      result = result.filter(f => f.userId === userId)
    }

    return result
  }

  async getAnalytics(): Promise<any> {
    const totalSessions = this.sessions.length
    const totalFeedback = this.feedback.length
    const positiveFeedback = this.feedback.filter(f => f.rating > 0).length
    const negativeFeedback = this.feedback.filter(f => f.rating < 0).length

    const averageSessionLength = this.sessions.reduce((sum, session) => {
      return sum + (session.messages?.length || 0)
    }, 0) / (totalSessions || 1)

    const mostActiveUsers = this.sessions
      .filter(s => s.userId)
      .reduce((acc, session) => {
        const userId = session.userId!
        acc[userId] = (acc[userId] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return {
      totalSessions,
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      satisfactionRate: totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0,
      averageSessionLength,
      mostActiveUsers: Object.entries(mostActiveUsers)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count }))
    }
  }
}