'use client'

import EnhancedChatbot from './EnhancedChatbot'

const ChatbotWrapper = () => {
  const handleMessageSent = (message: any) => {
    // Analytics tracking could go here
    console.log('Message sent:', message.content)
  }

  const handleSessionStart = (session: any) => {
    console.log('Chat session started:', session.id)
  }

  const handleError = (error: string) => {
    console.error('Chatbot error:', error)
  }

  return (
    <EnhancedChatbot
      position="bottom-right"
      theme="default"
      enablePersistence={true}
      customPrompt="Hello! I'm GRANITE TECH's AI assistant. I can help you learn about our services, get pricing information, explore our portfolio, and answer any questions about our development process. How can I assist you today?"
      onMessageSent={handleMessageSent}
      onSessionStart={handleSessionStart}
      onError={handleError}
    />
  )
}

export default ChatbotWrapper