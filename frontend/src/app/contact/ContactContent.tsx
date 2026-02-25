'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { requestsAPI, type BlobDocument } from '@/lib/api'
import BlobFileUpload from '@/components/BlobFileUpload'
import { trackEvent, trackPageView } from '@/lib/analytics'

const services = [
  { id: 'web-development', name: 'Web Development' },
  { id: 'mobile-development', name: 'Mobile App Development' },
  { id: 'cloud-solutions', name: 'Cloud Solutions' },
  { id: 'api-development', name: 'API Development' },
  { id: 'security-audit', name: 'Security Audit' },
  { id: 'analytics-bi', name: 'Analytics & BI' },
  { id: 'custom', name: 'Custom Solution' },
  { id: 'consultation', name: 'General Consultation' }
]

export default function ContactContent() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    serviceInterested: '',
    projectBudget: '',
    projectTimeline: '',
    description: ''
  })
  const [uploadedDocs, setUploadedDocs] = useState<BlobDocument[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    trackPageView('/contact')

    // Pre-fill service if coming from a specific service page
    const serviceParam = searchParams.get('service')
    if (serviceParam) {
      setFormData(prev => ({ ...prev, serviceInterested: serviceParam }))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const removeDoc = (index: number) => {
    setUploadedDocs(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const result = await requestsAPI.submitRequest(formData, uploadedDocs)
      
      if (result.success) {
        trackEvent('request_submitted', {
          serviceInterested: formData.serviceInterested,
          projectBudget: formData.projectBudget,
        })
        setIsSubmitted(true)
        setFormData({
          fullName: '',
          email: '',
          company: '',
          phone: '',
          serviceInterested: '',
          projectBudget: '',
          projectTimeline: '',
          description: ''
        })
        setUploadedDocs([])
      } else {
        trackEvent('request_failed', { reason: result.message })
        setError(result.message || 'Failed to send message. Please try again.')
      }
    } catch (err: any) {
      trackEvent('request_failed', { reason: err.response?.data?.message })
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
      console.error('Form submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="pt-32 pb-20">
        <div className="wide-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-granite-900 mb-4">
                Thank You!
              </h2>
              <p className="text-granite-600 mb-8">
                Your message has been sent successfully. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-gradient-to-r from-crimson-600 to-amber-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-crimson-700 hover:to-amber-600 transition-all duration-300"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20">
      <div className="wide-container">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-granite-900 mb-6">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson-600 to-amber-500">Touch</span>
          </h1>
          <p className="text-xl text-granite-600 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your business with cutting-edge technology? Let's discuss your project and create something amazing together.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-granite-900 mb-6">Send us a message</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-granite-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-granite-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-granite-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-granite-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                    placeholder="+263 XXX XXX XXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="serviceInterested" className="block text-sm font-medium text-granite-700 mb-2">
                  Service Interested In
                </label>
                <select
                  id="serviceInterested"
                  name="serviceInterested"
                  value={formData.serviceInterested}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select a service</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="projectBudget" className="block text-sm font-medium text-granite-700 mb-2">
                    Project Budget
                  </label>
                  <select
                    id="projectBudget"
                    name="projectBudget"
                    value={formData.projectBudget}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-5k">Under $5,000</option>
                    <option value="5k-15k">$5,000 - $15,000</option>
                    <option value="15k-50k">$15,000 - $50,000</option>
                    <option value="50k-plus">$50,000+</option>
                    <option value="not-sure">Not sure yet</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="projectTimeline" className="block text-sm font-medium text-granite-700 mb-2">
                    Project Timeline
                  </label>
                  <select
                    id="projectTimeline"
                    name="projectTimeline"
                    value={formData.projectTimeline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-3-months">1-3 months</option>
                    <option value="3-6-months">3-6 months</option>
                    <option value="6-months-plus">6+ months</option>
                    <option value="exploring">Just exploring</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-granite-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-granite-300 rounded-lg focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Tell us about your project, goals, and any specific requirements..."
                />
              </div>

              {/* File Upload (Blob: Inquiries/category/date/file-name) */}
              <div>
                <label className="block text-sm font-medium text-granite-700 mb-2">
                  Attachments (Optional)
                </label>
                <BlobFileUpload
                  uploadType={{
                    type: 'inquiry',
                    category: formData.serviceInterested || 'general',
                  }}
                  onUploaded={(url, pathname, file) =>
                    setUploadedDocs(prev => [
                      ...prev,
                      {
                        url,
                        pathname,
                        originalName: file.name,
                        fileSize: file.size,
                        mimeType: file.type || 'application/octet-stream',
                      },
                    ])
                  }
                  label="Drop files here or click to upload"
                  hint="PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, Images, ZIP up to 10MB each"
                />
                {uploadedDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedDocs.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentArrowUpIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDoc(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-crimson-600 to-amber-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-crimson-700 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-granite-900 mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-crimson-100 p-3 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-crimson-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-granite-900">Email</h3>
                    <p className="text-granite-600">hello@quantistech.co.zw</p>
                    <p className="text-granite-600">support@quantistech.co.zw</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-granite-900 mb-2">Phone</h3>
                    <div className="space-y-1">
                      <p className="text-granite-600">
                        <a href="tel:+263777937721" className="hover:text-crimson-600 transition-colors block py-1">+263 777 937 721</a>
                      </p>
                      <p className="text-granite-600">
                        <a href="tel:+263717935866" className="hover:text-crimson-600 transition-colors block py-1">+263 717 935 866</a>
                      </p>
                      <p className="text-granite-600">
                        <a href="tel:+263774211041" className="hover:text-crimson-600 transition-colors block py-1">+263 774 211 041</a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MapPinIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-granite-900">Office</h3>
                    <p className="text-granite-600">Harare, Zimbabwe</p>
                    <p className="text-granite-600">Available Nationwide</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-granite-900">Business Hours</h3>
                    <p className="text-granite-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-granite-600">Saturday: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="bg-gradient-to-r from-crimson-600 to-amber-500 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Quick Response Guarantee</h3>
              <p className="mb-4">
                We understand that time is crucial for your business. That's why we promise:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  Initial response within 2 hours
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  Detailed proposal within 24 hours
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  Free consultation call scheduled within 48 hours
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}