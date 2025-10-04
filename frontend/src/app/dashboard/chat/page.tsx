'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FaceSmileIcon,
  ArrowPathIcon,
  StarIcon,
  ClockIcon,
  UsersIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline'
import { chatAPI, authAPI } from '@/lib/api'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isUser: boolean
  rating?: number
  feedback?: string
}

interface ChatSession {
  id: string
  sessionId: string
  userId?: string
  messages: Message[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
}

export default function ChatPage() {
  // State Management
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  
  // UI State
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackComment, setFeedbackComment] = useState('')
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUserProfile()
    loadChatSessions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadUserProfile = async () => {
    try {
      const userData = await authAPI.getProfile()
      setUser(userData)
    } catch (err: any) {
      console.error('Error loading user profile:', err)
    }
  }

  const loadChatSessions = async () => {
    try {
      setLoading(true)
      const response = await chatAPI.getSessions()
      if (response.success) {
        setSessions(response.data || [])
        // Auto-select first session if available
        if (response.data && response.data.length > 0) {
          setCurrentSession(response.data[0])
          setMessages(response.data[0].messages || [])
        }
      }
    } catch (err: any) {
      setError('Failed to load chat sessions')
      console.error('Error loading chat sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const createNewSession = async () => {
    try {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionData = {
        sessionId: newSessionId,
        userId: user?.id,
        messages: [],
        metadata: {
          createdBy: user?.email,
          title: 'New Chat Session'
        }
      }

      const response = await chatAPI.createSession(sessionData)
      if (response.success) {
        await loadChatSessions()
        // Select the new session
        const newSession = response.data
        setCurrentSession(newSession)
        setMessages([])
      }
    } catch (err: any) {
      setError('Failed to create new chat session')
      console.error('Error creating chat session:', err)
    }
  }

  const selectSession = async (session: ChatSession) => {
    try {
      const response = await chatAPI.getSession(session.id)
      if (response.success) {
        setCurrentSession(response.data)
        setMessages(response.data.messages || [])
      }
    } catch (err: any) {
      setError('Failed to load chat session')
      console.error('Error loading chat session:', err)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !currentSession) return

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: message.trim(),
      sender: user ? `${user.firstName} ${user.lastName}` : 'You',
      timestamp: new Date().toISOString(),
      isUser: true
    }

    // Add message to UI immediately
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    setMessage('')

    // Show typing indicator
    setIsTyping(true)

    try {
      // Update session with new message
      await chatAPI.createSession({
        sessionId: currentSession.sessionId,
        userId: user?.id,
        messages: updatedMessages,
        metadata: currentSession.metadata
      })

      // Simulate AI response (in real app, this would be an AI service call)
      setTimeout(async () => {
        const aiResponse: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: generateAIResponse(newMessage.content),
          sender: 'Granite Tech AI',
          timestamp: new Date().toISOString(),
          isUser: false
        }

        const finalMessages = [...updatedMessages, aiResponse]
        setMessages(finalMessages)
        setIsTyping(false)

        // Save final session state
        await chatAPI.createSession({
          sessionId: currentSession.sessionId,
          userId: user?.id,
          messages: finalMessages,
          metadata: currentSession.metadata
        })
      }, 1500)

    } catch (err: any) {
      setError('Failed to send message')
      console.error('Error sending message:', err)
      setIsTyping(false)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    // Simple AI response simulation - in real app, this would call an AI service
    const responses = [
      "Thank you for your message! I'm here to help you with your Granite Tech questions.",
      "That's a great question! Let me provide you with some information about our services.",
      "I understand your concern. Our team specializes in solving complex technical challenges.",
      "Absolutely! We have extensive experience in that area. Would you like to schedule a consultation?",
      "That's an interesting project! We'd love to discuss how we can help bring your vision to life.",
      "Great point! Our approach focuses on delivering high-quality, scalable solutions.",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const openFeedbackModal = (message: Message) => {
    setSelectedMessage(message)
    setShowFeedbackModal(true)
  }

  const submitFeedback = async () => {
    if (!selectedMessage || !currentSession) return

    try {
      await chatAPI.createFeedback({
        messageId: selectedMessage.id,
        sessionId: currentSession.sessionId,
        userId: user?.id,
        rating: feedbackRating,
        comment: feedbackComment || undefined
      })

      setShowFeedbackModal(false)
      setSelectedMessage(null)
      setFeedbackRating(5)
      setFeedbackComment('')
    } catch (err: any) {
      setError('Failed to submit feedback')
      console.error('Error submitting feedback:', err)
    }
  }

  const filteredSessions = sessions.filter(session =>
    (session.sessionId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.metadata?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-granite-800 border-b border-granite-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Chat Management</h1>
            <p className="text-sm text-gray-300">
              Real-time communication with clients and team members
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={createNewSession}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-800 hover:bg-green-600 active:bg-green-700 transition-colors"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex-shrink-0 bg-red-900/20 border-b border-red-900/50 text-red-200 px-6 py-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError('')}
                className="text-red-400 hover:text-red-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sessions Sidebar */}
        <div className="w-1/3 bg-granite-800 border-r border-granite-700 flex flex-col">
          {/* Sessions Header */}
          <div className="flex-shrink-0 p-4 border-b border-granite-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400 text-sm"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <div className="p-4 text-center">
                <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-white">No conversations</h3>
                <p className="mt-1 text-sm text-gray-400">Start a new conversation to get started.</p>
                <button
                  onClick={createNewSession}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-amber-800 hover:bg-green-600 active:bg-green-700 transition-colors"
                >
                  <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                  New Chat
                </button>
              </div>
            ) : (
              <div className="divide-y divide-granite-700">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={`p-4 cursor-pointer hover:bg-granite-700 transition-colors ${
                      currentSession?.id === session.id ? 'bg-granite-700 border-r-2 border-yellow-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-amber-800 flex items-center justify-center">
                          <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white truncate">
                            {session.metadata?.title || `Session ${session.sessionId.slice(-8)}`}
                          </p>
                          <div className="flex items-center text-xs text-gray-400">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {formatTime(session.updatedAt)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {session.messages && session.messages.length > 0
                            ? session.messages[session.messages.length - 1].content
                            : 'No messages yet'}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <ChatBubbleBottomCenterTextIcon className="h-3 w-3 mr-1" />
                          {session.messages?.length || 0} messages
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 bg-granite-800 border-b border-granite-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-900 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {currentSession.metadata?.title || `Session ${currentSession.sessionId.slice(-8)}`}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Created {new Date(currentSession.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={loadChatSessions}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-granite-900 p-6 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                        msg.isUser
                          ? 'bg-green-600 text-white rounded-l-lg rounded-tr-lg'
                          : 'bg-granite-700 text-white rounded-r-lg rounded-tl-lg'
                      } px-4 py-2 shadow-lg`}
                    >
                      <div className="flex items-start space-x-2">
                        {!msg.isUser && (
                          <UserCircleIcon className="h-6 w-6 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            {msg.sender}
                          </p>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                            {!msg.isUser && (
                              <button
                                onClick={() => openFeedbackModal(msg)}
                                className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                              >
                                <StarIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {msg.isUser && (
                          <UserCircleIcon className="h-6 w-6 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-granite-700 text-white rounded-r-lg rounded-tl-lg px-4 py-2 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <UserCircleIcon className="h-6 w-6 text-gray-300" />
                        <div>
                          <p className="text-sm font-medium mb-1">Granite Tech AI</p>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 bg-granite-800 border-t border-granite-700 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <input
                    ref={messageInputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-granite-600 rounded-full bg-granite-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isTyping}
                    className="p-2 bg-amber-800 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-green-700"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-granite-900">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-white">Select a conversation</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Choose a conversation from the sidebar or start a new one.
                </p>
                <button
                  onClick={createNewSession}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-900 hover:bg-yellow-800"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-granite-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">Rate this response</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className={`p-1 ${
                          star <= feedbackRating ? 'text-yellow-400' : 'text-gray-400'
                        } hover:text-yellow-300 transition-colors`}
                      >
                        <StarIcon className="h-6 w-6" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Comments (optional)
                  </label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Your feedback helps us improve..."
                    rows={3}
                    className="w-full px-3 py-2 border border-granite-600 rounded-md bg-granite-700 text-white placeholder-gray-400"
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={submitFeedback}
                    className="flex-1 bg-yellow-900 hover:bg-yellow-800 text-white py-2 px-4 rounded transition-colors"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => {
                      setShowFeedbackModal(false)
                      setSelectedMessage(null)
                      setFeedbackRating(5)
                      setFeedbackComment('')
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}