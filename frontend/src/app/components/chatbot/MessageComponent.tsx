import * as React from 'react'
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  ClipboardDocumentIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { ChatMessage } from './types'

interface MessageComponentProps {
  message: ChatMessage
  onFeedback?: (messageId: string, rating: number) => void
  onCopy?: (content: string) => void
  onShare?: (message: ChatMessage) => void
}

const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  onFeedback,
  onCopy,
  onShare
}) => {
  const handleCopy = () => {
    if (onCopy) {
      onCopy(message.content)
    } else {
      navigator.clipboard.writeText(message.content)
    }
  }

  const formatMessageContent = (content: string) => {
    // Convert basic markdown-like formatting to JSX
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\n)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-granite-100 px-1 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part === '\n') {
        return <br key={index} />
      }
      return part
    })
  }

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
        message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.sender === 'user' 
            ? 'bg-crimson-600 text-white' 
            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
        }`}>
          {message.sender === 'user' ? (
            <span className="text-sm font-semibold">U</span>
          ) : (
            <span className="text-sm font-semibold">AI</span>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`rounded-2xl px-4 py-3 ${
          message.sender === 'user'
            ? 'bg-crimson-600 text-white'
            : 'bg-white border border-granite-200 text-granite-800 shadow-sm'
        }`}>
          <div className="text-sm leading-relaxed">
            {formatMessageContent(message.content)}
          </div>
          
          <div className={`flex items-center justify-between mt-2 text-xs ${
            message.sender === 'user' ? 'text-crimson-100' : 'text-granite-500'
          }`}>
            <span>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {/* Message Actions */}
            {message.sender === 'bot' && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-granite-100 rounded transition-colors duration-200"
                  title="Copy message"
                >
                  <ClipboardDocumentIcon className="h-3 w-3" />
                </button>
                
                {onFeedback && (
                  <>
                    <button
                      onClick={() => onFeedback(message.id, 1)}
                      className="p-1 hover:bg-green-100 hover:text-green-600 rounded transition-colors duration-200"
                      title="Helpful"
                    >
                      <HandThumbUpIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onFeedback(message.id, -1)}
                      className="p-1 hover:bg-red-100 hover:text-red-600 rounded transition-colors duration-200"
                      title="Not helpful"
                    >
                      <HandThumbDownIcon className="h-3 w-3" />
                    </button>
                  </>
                )}
                
                {onShare && (
                  <button
                    onClick={() => onShare(message)}
                    className="p-1 hover:bg-granite-100 rounded transition-colors duration-200"
                    title="Share message"
                  >
                    <ShareIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Metadata */}
          {message.metadata && (
            <div className="mt-1 text-xs opacity-75">
              {message.metadata.responseTime && (
                <span>Response time: {message.metadata.responseTime}ms</span>
              )}
              {message.metadata.confidence && (
                <span className="ml-2">Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageComponent