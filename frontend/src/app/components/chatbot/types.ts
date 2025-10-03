export interface ChatSession {
  id: string
  userId?: string
  sessionName?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface ChatMessage {
  id: string
  sessionId: string
  content: string
  sender: 'user' | 'bot' | 'system'
  timestamp: Date
  metadata?: {
    intent?: string
    confidence?: number
    responseTime?: number
    model?: string
    error?: boolean
  }
}

export interface ChatbotConfig {
  apiKey?: string
  model: string
  maxTokens: number
  temperature: number
  systemPrompt: string
  fallbackResponses: string[]
  responseDelay: {
    min: number
    max: number
  }
}

export interface ChatbotState {
  isOpen: boolean
  isTyping: boolean
  currentSession: ChatSession | null
  config: ChatbotConfig
  error: string | null
}

export interface ChatbotProps {
  userId?: string
  initialMessage?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'default' | 'dark' | 'minimal'
  enablePersistence?: boolean
  customPrompt?: string
  onMessageSent?: (message: ChatMessage) => void
  onSessionStart?: (session: ChatSession) => void
  onError?: (error: string) => void
}

export type ChatbotIntent = 
  | 'greeting'
  | 'services'
  | 'pricing'
  | 'contact'
  | 'portfolio'
  | 'process'
  | 'support'
  | 'technical'
  | 'business'
  | 'default'

export interface IntentClassificationResult {
  intent: ChatbotIntent
  confidence: number
  entities?: Record<string, string>
}

export interface ChatbotResponse {
  content: string
  intent: ChatbotIntent
  confidence: number
  responseTime: number
  followUpQuestions?: string[]
  suggestedActions?: Array<{
    label: string
    action: string
    url?: string
  }>
}