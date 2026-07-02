'use client'

import { useState } from 'react'
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EyeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { requestsAPI } from '@/lib/api'

interface ProjectRequest {
  id: string
  fullName: string
  email: string
  company?: string
  phone?: string
  serviceInterested: string
  projectBudget: string
  projectTimeline: string
  description: string
  status: string
  documents: any[]
  messages: any[]
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof ClockIcon; description: string }
> = {
  pending: {
    label: 'Pending Review',
    color: 'bg-amber-200 text-amber-900',
    icon: ClockIcon,
    description: 'Your request is being reviewed by our team',
  },
  reviewing: {
    label: 'Under Review',
    color: 'bg-blue-100 text-blue-800',
    icon: EyeIcon,
    description: 'Our team is analyzing your requirements',
  },
  quoted: {
    label: 'Quote Sent',
    color: 'bg-purple-100 text-purple-800',
    icon: DocumentIcon,
    description: "We've prepared a quote for your project",
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    description: 'Your project has been accepted and will start soon',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-indigo-100 text-indigo-800',
    icon: ClockIcon,
    description: 'Your project is currently being developed',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircleIcon,
    description: 'Your project has been completed successfully',
  },
  rejected: {
    label: 'Not Suitable',
    color: 'bg-red-100 text-red-800',
    icon: XCircleIcon,
    description: 'Unfortunately, we cannot proceed with this request',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircleIcon,
    description: 'This request has been cancelled',
  },
}

type TrackRequestPanelProps = {
  variant?: 'page' | 'embedded'
}

export default function TrackRequestPanel({ variant = 'page' }: TrackRequestPanelProps) {
  const embedded = variant === 'embedded'
  const [email, setEmail] = useState('')
  const [requests, setRequests] = useState<ProjectRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setRequests([])
      const response = await requestsAPI.getRequestsByEmail(email.trim())
      if (response.success) {
        setRequests(response.data || [])
        if (!response.data?.length) {
          setError('No requests found for this email address')
        }
      } else {
        setError(response.message || 'Failed to find requests')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search requests')
    } finally {
      setLoading(false)
    }
  }

  const openRequestDetails = (request: ProjectRequest) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const sendMessage = async () => {
    if (!selectedRequest || !message.trim()) return

    try {
      setSendingMessage(true)
      const messageData = {
        senderName: selectedRequest.fullName,
        senderEmail: selectedRequest.email,
        senderType: 'client',
        message: message.trim(),
      }

      const response = await requestsAPI.addMessage(selectedRequest.id, messageData)
      if (response.success) {
        const updatedResponse = await requestsAPI.getRequest(selectedRequest.id)
        if (updatedResponse.success) {
          setSelectedRequest(updatedResponse.data)
          setRequests((prev) =>
            prev.map((req) => (req.id === selectedRequest.id ? updatedResponse.data : req))
          )
        }
        setMessage('')
      } else {
        setError(response.message || 'Failed to send message')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    const IconComponent = config.icon
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <IconComponent className="w-3.5 h-3.5 mr-1.5" />
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <>
      {!embedded && (
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-granite-900 mb-4">
            Track Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-600 to-amber-500">
              Project Request
            </span>
          </h1>
          <p className="text-xl text-granite-600 max-w-3xl mx-auto">
            Enter your email address to view the status of your project requests and communicate with
            our team.
          </p>
        </div>
      )}

      <form onSubmit={handleSearch} className={embedded ? 'space-y-4' : 'max-w-2xl mx-auto'}>
        <div className={embedded ? 'space-y-3' : 'flex flex-col sm:flex-row gap-4'}>
          <div className="flex-1">
            {!embedded && (
              <label htmlFor="track-email" className="block text-sm font-medium text-granite-700 mb-2">
                Email Address
              </label>
            )}
            <input
              type="email"
              id="track-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div className={embedded ? '' : 'flex items-end'}>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                embedded
                  ? 'bg-crimson-900 hover:bg-crimson-800'
                  : 'bg-gradient-to-r from-crimson-600 to-amber-500 hover:from-crimson-700 hover:to-amber-600'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Searching...' : 'Track your request'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div
          className={`${
            embedded ? 'mt-4' : 'mb-8'
          } bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm`}
        >
          {error}
        </div>
      )}

      {requests.length > 0 && (
        <div className={`${embedded ? 'mt-6 pt-6 border-t border-granite-200' : 'mt-8 space-y-6'}`}>
          {!embedded && (
            <h2 className="text-2xl font-bold text-granite-900">Your Project Requests</h2>
          )}
          {embedded && (
            <h3 className="text-lg font-semibold text-granite-900 mb-4">Your requests</h3>
          )}
          <div className="space-y-4">
            {requests.map((request) => {
              const statusConfig = STATUS_CONFIG[request.status]
              return (
                <div
                  key={request.id}
                  className={`rounded-xl border border-granite-200 overflow-hidden ${
                    embedded ? 'bg-granite-50' : 'bg-white shadow-lg'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="text-base font-semibold text-granite-900">
                          {request.serviceInterested}
                        </h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-granite-500">Submitted: </span>
                          <span className="text-granite-900">{formatDate(request.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-granite-500">Budget: </span>
                          <span className="text-granite-900">{request.projectBudget}</span>
                        </div>
                      </div>
                      {statusConfig && (
                        <p className="text-sm text-granite-600">{statusConfig.description}</p>
                      )}
                      <p className="text-sm text-granite-700 line-clamp-2">{request.description}</p>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-xs text-granite-500 flex items-center">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          {request.messages?.length || 0} messages
                          {request.documents?.length ? (
                            <>
                              <PaperClipIcon className="w-4 h-4 ml-3 mr-1" />
                              {request.documents.length} file
                              {request.documents.length !== 1 ? 's' : ''}
                            </>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          onClick={() => openRequestDetails(request)}
                          className="text-sm font-medium text-crimson-800 hover:text-crimson-600"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Project Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Service:</label>
                    <p className="text-sm text-gray-900">{selectedRequest.serviceInterested}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget:</label>
                    <p className="text-sm text-gray-900">{selectedRequest.projectBudget}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timeline:</label>
                    <p className="text-sm text-gray-900">{selectedRequest.projectTimeline}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status:</label>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description:</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>

              {selectedRequest.documents?.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Your Attachments</h4>
                  <div className="space-y-2">
                    {selectedRequest.documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-900 flex-1">{doc.originalName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Communication History</h4>
                {selectedRequest.messages?.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                    {selectedRequest.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${
                          msg.senderType === 'client'
                            ? 'bg-blue-50 ml-8'
                            : msg.senderType === 'system'
                              ? 'bg-gray-50'
                              : 'bg-green-50 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {msg.senderType === 'client'
                              ? 'You'
                              : msg.senderType === 'system'
                                ? 'System'
                                : 'Quantis Technologies Team'}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(msg.sentAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No messages yet. Start the conversation below!</p>
                )}

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Send a message to our team
                  </label>
                  <div className="flex space-x-3">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-crimson-500 focus:border-crimson-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={sendingMessage || !message.trim()}
                      className="bg-crimson-900 hover:bg-crimson-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
