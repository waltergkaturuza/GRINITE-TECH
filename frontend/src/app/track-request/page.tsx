'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  DocumentIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EyeIcon
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
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedBudget?: number
  estimatedHours?: number
  estimatedStartDate?: string
  estimatedEndDate?: string
  adminNotes?: string
  assignedTo?: any
  documents: any[]
  messages: any[]
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: 'bg-amber-200 text-amber-900', icon: ClockIcon, description: 'Your request is being reviewed by our team' },
  reviewing: { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: EyeIcon, description: 'Our team is analyzing your requirements' },
  quoted: { label: 'Quote Sent', color: 'bg-purple-100 text-purple-800', icon: DocumentIcon, description: 'We\'ve prepared a quote for your project' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, description: 'Your project has been accepted and will start soon' },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-800', icon: ClockIcon, description: 'Your project is currently being developed' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, description: 'Your project has been completed successfully' },
  rejected: { label: 'Not Suitable', color: 'bg-red-100 text-red-800', icon: XCircleIcon, description: 'Unfortunately, we cannot proceed with this request' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircleIcon, description: 'This request has been cancelled' },
}

export default function TrackRequestPage() {
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
      const response = await requestsAPI.getRequestsByEmail(email)
      if (response.success) {
        setRequests(response.data)
        if (response.data.length === 0) {
          setError('No requests found for this email address')
        }
      } else {
        setError(response.message || 'Failed to find requests')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search requests')
      console.error('Error searching requests:', err)
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
        // Refresh the request details
        const updatedResponse = await requestsAPI.getRequest(selectedRequest.id)
        if (updatedResponse.success) {
          setSelectedRequest(updatedResponse.data)
          // Update the request in the list
          setRequests(prev => prev.map(req => 
            req.id === selectedRequest.id ? updatedResponse.data : req
          ))
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
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    const IconComponent = config?.icon || ClockIcon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {config?.label || status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-granite-900 mb-4">
            Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-600 to-amber-500">Project Request</span>
          </h1>
          <p className="text-xl text-granite-600 max-w-3xl mx-auto">
            Enter your email address to view the status of your project requests and communicate with our team.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium text-granite-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                  placeholder="Enter the email you used to submit your request"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-crimson-600 to-amber-500 text-white font-semibold py-3 px-8 rounded-lg hover:from-crimson-700 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Results */}
        {requests.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-granite-900">Your Project Requests</h2>
            
            <div className="grid gap-6">
              {requests.map((request) => {
                const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG]
                return (
                  <div key={request.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-granite-900">
                              {request.serviceInterested}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-sm font-medium text-granite-500">Submitted</label>
                              <p className="text-granite-900">{formatDate(request.createdAt)}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-granite-500">Budget Range</label>
                              <p className="text-granite-900">{request.projectBudget}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-granite-500">Timeline</label>
                              <p className="text-granite-900">{request.projectTimeline}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-granite-500">Messages</label>
                              <p className="text-granite-900 flex items-center">
                                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                                {request.messages?.length || 0} messages
                              </p>
                            </div>
                          </div>

                          {statusConfig && (
                            <div className="bg-granite-50 rounded-lg p-4 mb-4">
                              <p className="text-sm text-granite-600">
                                <strong>Status Update:</strong> {statusConfig.description}
                              </p>
                            </div>
                          )}

                          <div className="mb-4">
                            <label className="text-sm font-medium text-granite-500">Project Description</label>
                            <p className="text-granite-700 mt-1 line-clamp-3">{request.description}</p>
                          </div>

                          {request.documents && request.documents.length > 0 && (
                            <div className="flex items-center text-sm text-granite-600">
                              <PaperClipIcon className="w-4 h-4 mr-1" />
                              {request.documents.length} attachment{request.documents.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6">
                          <button
                            onClick={() => openRequestDetails(request)}
                            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                          >
                            View Details
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

        {/* Request Details Modal */}
        {isModalOpen && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Request Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Information */}
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
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Documents */}
                {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Your Attachments</h4>
                    <div className="space-y-2">
                      {selectedRequest.documents.map((doc, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm text-gray-900 flex-1">{doc.originalName}</span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Communication History</h4>
                  
                  {selectedRequest.messages && selectedRequest.messages.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                      {selectedRequest.messages.map((msg, index) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          msg.senderType === 'client' 
                            ? 'bg-blue-50 ml-8' 
                            : msg.senderType === 'system'
                            ? 'bg-gray-50'
                            : 'bg-green-50 mr-8'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {msg.senderType === 'client' ? 'You' : 
                               msg.senderType === 'system' ? 'System' : 
                               'GRANITE TECH Team'}
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

                  {/* Message Input */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send a message to our team
                    </label>
                    <div className="flex space-x-3">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={3}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={sendingMessage || !message.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}