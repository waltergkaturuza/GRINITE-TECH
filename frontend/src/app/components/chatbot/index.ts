// Main exports for the GRANITE TECH AI Chatbot system
export { default as Chatbot } from './Chatbot'
export { default as EnhancedChatbot } from './EnhancedChatbot'
export { default as ChatbotWrapper } from './ChatbotWrapper'
export { default as MessageComponent } from './MessageComponent'
export { ChatbotService } from './ChatbotService'

// Type exports
export type {
  ChatSession,
  ChatMessage,
  ChatbotConfig,
  ChatbotState,
  ChatbotProps,
  ChatbotIntent,
  IntentClassificationResult,
  ChatbotResponse
} from './types'

// Utility functions
import type { ChatSession } from './types'

export const createChatSession = (userId?: string): ChatSession => ({
  id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId,
  sessionName: `Chat ${new Date().toLocaleString()}`,
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    initialUrl: typeof window !== 'undefined' ? window.location.href : 'unknown'
  }
})

export const formatChatTimestamp = (date: Date): string => {
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60)
    return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}

export const generateSessionName = (firstMessage?: string): string => {
  if (!firstMessage) return `Chat ${new Date().toLocaleTimeString()}`
  
  const words = firstMessage.split(' ').slice(0, 4)
  return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '')
}