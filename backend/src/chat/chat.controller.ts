import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common'
import { ChatService } from './chat.service'

export interface CreateChatSessionDto {
  sessionId: string
  userId?: string
  messages: any[]
  metadata?: Record<string, any>
}

export interface CreateFeedbackDto {
  messageId: string
  sessionId?: string
  userId?: string
  rating: number
  comment?: string
  metadata?: Record<string, any>
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  async createSession(@Body() createSessionDto: CreateChatSessionDto) {
    try {
      const session = await this.chatService.createSession(createSessionDto)
      return {
        success: true,
        data: session,
        message: 'Chat session saved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to save chat session'
      }
    }
  }

  @Get('sessions')
  async getSessions(@Query('userId') userId?: string) {
    try {
      const sessions = await this.chatService.getSessions(userId)
      return {
        success: true,
        data: sessions,
        message: 'Chat sessions retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve chat sessions'
      }
    }
  }

  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    try {
      const session = await this.chatService.getSession(id)
      return {
        success: true,
        data: session,
        message: 'Chat session retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve chat session'
      }
    }
  }

  @Post('feedback')
  async createFeedback(@Body() createFeedbackDto: CreateFeedbackDto) {
    try {
      const feedback = await this.chatService.createFeedback(createFeedbackDto)
      return {
        success: true,
        data: feedback,
        message: 'Feedback saved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to save feedback'
      }
    }
  }

  @Get('feedback')
  async getFeedback(@Query('sessionId') sessionId?: string, @Query('userId') userId?: string) {
    try {
      const feedback = await this.chatService.getFeedback(sessionId, userId)
      return {
        success: true,
        data: feedback,
        message: 'Feedback retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve feedback'
      }
    }
  }

  @Get('analytics')
  async getAnalytics() {
    try {
      const analytics = await this.chatService.getAnalytics()
      return {
        success: true,
        data: analytics,
        message: 'Chat analytics retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve chat analytics'
      }
    }
  }
}