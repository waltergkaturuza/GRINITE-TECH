// Enhanced Chatbot with AI-powered responses and better UX
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  MinusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { ChatMessage, ChatSession, ChatbotProps } from './types'
import { ChatbotService } from './ChatbotService'
import MessageComponent from './MessageComponent'

const EnhancedChatbot: React.FC<ChatbotProps> = ({
  userId,
  initialMessage,
  position = 'bottom-right',
  theme = 'default',
  enablePersistence = true,
  customPrompt,
  onMessageSent,
  onSessionStart,
  onError
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [chatbotService] = useState(() => new ChatbotService())
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize chatbot
  useEffect(() => {
    const initializeChat = () => {
      const session: ChatSession = {
        id: `session_${Date.now()}`,
        userId,
        sessionName: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          userAgent: navigator.userAgent,
          initialUrl: window.location.href
        }
      }

      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sessionId: session.id,
        content: customPrompt || initialMessage || "Hello! I'm GRANITE TECH's AI assistant. I can help you learn about our services, pricing, and answer any questions you have. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          intent: 'greeting',
          confidence: 1.0,
          responseTime: 0
        }
      }

      session.messages = [welcomeMessage]
      setCurrentSession(session)
      setMessages([welcomeMessage])

      if (onSessionStart) {
        onSessionStart(session)
      }
    }

    initializeChat()
  }, [userId, initialMessage, customPrompt, onSessionStart])

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping || !currentSession) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sessionId: currentSession.id,
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    // Add user message
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

  // Call onMessageSent callback
    if (onMessageSent) {
      onMessageSent(userMessage)
    }

    try {
      // Classify intent and generate response
      const intentResult = chatbotService.classifyIntent(userMessage.content)
      const response = chatbotService.generateResponse(
        userMessage.content, 
        intentResult.intent, 
        intentResult.entities
      )

      // Simulate realistic typing delay
      const typingDelay = Math.max(800, Math.min(3000, response.content.length * 20))
      
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          sessionId: currentSession.id,
          content: response.content,
          sender: 'bot',
          timestamp: new Date(),
          metadata: {
            intent: response.intent,
            confidence: response.confidence,
            responseTime: response.responseTime,
            model: 'granite-ai-v1'
          }
        }

        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)

        // Update session
        const updatedSession = {
          ...currentSession,
          messages: [...currentSession.messages, userMessage, botMessage],
          updatedAt: new Date()
        }
        setCurrentSession(updatedSession)

        // Save to backend if persistence is enabled
        if (enablePersistence) {
          chatbotService.saveChatSession(updatedSession.id, updatedSession.messages)
            .catch(error => console.warn('Failed to save chat session:', error))
        }
      }, typingDelay)

    } catch (error) {
      console.error('Error generating response:', error)
      setIsTyping(false)
      
      if (onError) {
        onError('Failed to generate response. Please try again.')
      }

      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sessionId: currentSession.id,
        content: "I apologize, but I'm having trouble responding right now. Please try again or contact our support team directly.",
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          intent: 'default',
          confidence: 0,
          responseTime: 0,
          error: true
        }
      }

      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    if (currentSession) {
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sessionId: currentSession.id,
        content: "Chat cleared! How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          intent: 'greeting',
          confidence: 1.0,
          responseTime: 0
        }
      }

      setMessages([welcomeMessage])
      const updatedSession = {
        ...currentSession,
        messages: [welcomeMessage],
        updatedAt: new Date()
      }
      setCurrentSession(updatedSession)
    }
  }

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      await chatbotService.sendFeedback(messageId, rating)
      // Show brief success indication
      console.log('Feedback sent successfully')
    } catch (error) {
      console.error('Failed to send feedback:', error)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    // Could show a toast notification here
  }

  const handleShare = (message: ChatMessage) => {
    if (navigator.share) {
      navigator.share({
        title: 'GRANITE TECH AI Response',
        text: message.content,
        url: window.location.href
      })
    } else {
      handleCopy(message.content)
    }
  }

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  // Theme classes
  const themeClasses = {
    default: 'bg-white border-granite-200',
    dark: 'bg-granite-800 border-granite-700',
    minimal: 'bg-white border-granite-100 shadow-sm'
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <div className={`mb-4 w-80 sm:w-96 h-96 ${themeClasses[theme]} rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-crimson-900 to-crimson-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <SparklesIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">GRANITE TECH AI</h3>
                <p className="text-xs text-crimson-100">
                  {isTyping ? 'Typing...' : 'Online • Ready to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Settings"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
              <button
                onClick={clearChat}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Clear chat"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Minimize"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-granite-50 border-b border-granite-200 p-3">
              <div className="text-sm text-granite-600">
                <p className="font-medium mb-2">Chat Settings</p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={enablePersistence}
                      onChange={(e) => {/* Handle persistence toggle */}}
                      className="mr-2"
                    />
                    Save conversation history
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-granite-50">
            {messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
                onCopy={handleCopy}
                onShare={handleShare}
              />
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-xs">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="h-4 w-4" />
                  </div>
                  <div className="bg-white border border-granite-200 text-granite-800 shadow-sm rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-granite-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-granite-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-granite-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-granite-200 bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isTyping}
                className="flex-1 px-3 py-2 border border-granite-300 rounded-full focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent disabled:bg-granite-100"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-crimson-600 hover:bg-crimson-700 disabled:bg-granite-300 text-white p-2 rounded-full transition-colors duration-200"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-granite-500 mt-2 text-center">
              Powered by GRANITE TECH AI • Ask me anything!
            </p>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {isOpen && isMinimized && (
        <div className="mb-4 bg-crimson-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 cursor-pointer hover:bg-crimson-700 transition-colors duration-200"
             onClick={() => setIsMinimized(false)}>
          <SparklesIcon className="h-4 w-4" />
          <span className="text-sm font-medium">GRANITE AI</span>
          {messages.length > 1 && (
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
              {messages.length - 1}
            </span>
          )}
        </div>
      )}

      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-crimson-600 hover:bg-crimson-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 group relative"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
          
          {/* AI Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <SparklesIcon className="h-3 w-3 text-white" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-granite-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Chat with AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-granite-800"></div>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

export default EnhancedChatbot