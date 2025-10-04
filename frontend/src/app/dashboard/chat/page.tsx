'use client'

import { useState } from 'react'
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'John Smith',
      content: 'Hi! I wanted to check on the progress of our website project.',
      timestamp: '10:30 AM',
      isUser: false
    },
    {
      id: 2,
      sender: 'You',
      content: 'Hello John! The project is going great. We\'re about 65% complete.',
      timestamp: '10:32 AM',
      isUser: true
    },
    {
      id: 3,
      sender: 'John Smith',
      content: 'That\'s excellent news! When do you expect to have the frontend completed?',
      timestamp: '10:35 AM',
      isUser: false
    }
  ])

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'You',
          content: message,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isUser: true
        }
      ])
      setMessage('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Chat</h1>
        <p className="mt-2 text-sm text-gray-300">
          Communicate with your clients and team
        </p>
      </div>

      {/* Chat Interface */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700 h-96 flex flex-col">
        <div className="px-4 py-3 border-b border-granite-600">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-white">John Smith</h3>
              <p className="text-xs text-gray-400">TechCorp Solutions</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.isUser 
                  ? 'bg-yellow-900 text-white' 
                  : 'bg-granite-700 text-gray-200'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="px-4 py-3 border-t border-granite-600">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-granite-600 rounded-md leading-5 bg-granite-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={handleSendMessage}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-900 hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Sidebar (placeholder) */}
      <div className="bg-granite-800 shadow rounded-lg border border-granite-700">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white mb-4">Recent Conversations</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-granite-700 rounded-lg hover:bg-granite-600 cursor-pointer">
              <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">John Smith</p>
                <p className="text-xs text-gray-400">TechCorp Solutions</p>
              </div>
              <div className="text-xs text-gray-400">10:35 AM</div>
            </div>
            <div className="flex items-center p-3 bg-granite-700 rounded-lg hover:bg-granite-600 cursor-pointer">
              <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Sarah Johnson</p>
                <p className="text-xs text-gray-400">Innovate LLC</p>
              </div>
              <div className="text-xs text-gray-400">Yesterday</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}