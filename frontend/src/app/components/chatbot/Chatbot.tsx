'use client'

import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../../../lib/api'
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  UserIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
  typing?: boolean
}

// Mock AI responses for the chatbot
const mockResponses = {
  greeting: [
    "Hello! I'm Quantis Technologies' AI assistant. How can I help you today?",
    "Hi there! Welcome to Quantis Technologies. What can I assist you with?",
    "Greetings! I'm here to help you learn about our services and answer your questions."
  ],
  services: [
    "We offer comprehensive web development, mobile app development, e-commerce solutions, API development, cloud infrastructure setup, and analytics dashboards. Which service interests you most?",
    "Quantis Technologies specializes in: Website Development ($1,999+), E-commerce Solutions ($4,999+), Mobile Apps ($7,999+), API Development ($2,999+), Cloud Infrastructure ($3,499+), and Analytics Dashboards ($3,999+). Would you like details about any specific service?"
  ],
  pricing: [
    "Our pricing starts at $1,999 for starter websites and goes up to $7,999 for mobile app development. All projects include ongoing support and maintenance. Would you like a detailed quote?",
    "We offer competitive pricing for all our services. Basic websites start at $1,999, while comprehensive e-commerce solutions are $4,999. Mobile app development begins at $7,999. Contact us for a custom quote!"
  ],
  contact: [
    "You can reach us through our contact form, email us directly, or call us. We're also available for live chat during business hours. What's the best way for us to help you?",
    "We'd love to hear from you! Use our contact form on the website, or reach out directly. We typically respond within 24 hours. How can we get started on your project?"
  ],
  portfolio: [
    "We've completed over 150 projects for clients ranging from startups to enterprise companies. Our portfolio includes e-commerce platforms, mobile apps, custom web applications, and cloud solutions. Would you like to see examples in a specific industry?",
    "Our team has delivered successful projects across various industries including tech, healthcare, finance, and retail. We'd be happy to share relevant case studies. What type of project are you considering?"
  ],
  process: [
    "Our development process includes: 1) Initial consultation and requirements gathering, 2) Design and planning phase, 3) Development and testing, 4) Deployment and launch, 5) Ongoing support and maintenance. Which phase would you like to know more about?",
    "We follow an agile development methodology with regular client feedback and updates. Projects typically take 2-12 weeks depending on complexity. We provide weekly progress reports and maintain open communication throughout."
  ],
  default: [
    "That's a great question! Let me help you with that. Can you provide more specific details about what you're looking for?",
    "I'd be happy to assist you with that. Could you elaborate on your requirements so I can provide the most helpful information?",
    "Thanks for asking! To give you the best answer, could you share more details about your project or needs?"
  ]
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Quantis Technologies' AI assistant. I can help you learn about our services, pricing, and answer any questions you have. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getResponseType = (userMessage: string): keyof typeof mockResponses => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return 'greeting'
    }
    if (message.includes('service') || message.includes('what do you do') || message.includes('offer')) {
      return 'services'
    }
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return 'pricing'
    }
    if (message.includes('contact') || message.includes('reach') || message.includes('call')) {
      return 'contact'
    }
    if (message.includes('portfolio') || message.includes('work') || message.includes('example') || message.includes('project')) {
      return 'portfolio'
    }
    if (message.includes('process') || message.includes('how do you') || message.includes('methodology')) {
      return 'process'
    }
    
    return 'default'
  }

  const generateBotResponse = (userMessage: string): string => {
    const responseType = getResponseType(userMessage)
    const responses = mockResponses[responseType]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: "Hello! I'm Quantis Technologies' AI assistant. I can help you learn about our services, pricing, and answer any questions you have. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ])
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-96 bg-white rounded-2xl shadow-2xl border border-granite-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-crimson-900 to-crimson-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <ComputerDesktopIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Quantis Technologies AI</h3>
                <p className="text-xs text-crimson-100">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
                title="Clear chat"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-crimson-600 text-white' 
                      : 'bg-granite-200 text-granite-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <UserIcon className="h-4 w-4" />
                    ) : (
                      <ComputerDesktopIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`rounded-2xl px-3 py-2 ${
                    message.sender === 'user'
                      ? 'bg-crimson-600 text-white'
                      : 'bg-granite-100 text-granite-800'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-crimson-100' : 'text-granite-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-xs">
                  <div className="w-6 h-6 rounded-full bg-granite-200 text-granite-600 flex items-center justify-center flex-shrink-0">
                    <ComputerDesktopIcon className="h-4 w-4" />
                  </div>
                  <div className="bg-granite-100 text-granite-800 rounded-2xl px-3 py-2">
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
          <div className="p-4 border-t border-granite-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-granite-300 rounded-full focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent"
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
              Ask me about our services, pricing, or any questions!
            </p>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-granite-600 hover:bg-granite-700' : 'bg-crimson-600 hover:bg-crimson-700'
        } text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 group`}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <div className="relative">
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Tooltip */}
      {!isOpen && (
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-granite-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
            Chat with AI Assistant
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-granite-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chatbot