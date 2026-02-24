'use client'

import EnhancedChatbot from './EnhancedChatbot'
import { trackEvent } from '@/lib/analytics'

const ChatbotWrapper = () => {
  const handleMessageSent = (message: any) => {
    trackEvent('chat_message_sent', {
      length: message?.content?.length ?? 0,
    })
  }

  const handleSessionStart = (session: any) => {
    trackEvent('chat_session_started', {
      sessionId: session?.id,
      initialUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }

  const handleError = (error: string) => {
    trackEvent('chat_error', { error })
    console.error('Chatbot error:', error)
  }

  return (
    <EnhancedChatbot
      position="bottom-right"
      theme="default"
      enablePersistence={true}
      customPrompt="Hello! I'm Quantis Technologies' AI assistant. I can help you learn about our services, get pricing information, explore our portfolio, and answer any questions about our development process. How can I assist you today?"
      onMessageSent={handleMessageSent}
      onSessionStart={handleSessionStart}
      onError={handleError}
    />
  )
}

export default ChatbotWrapper