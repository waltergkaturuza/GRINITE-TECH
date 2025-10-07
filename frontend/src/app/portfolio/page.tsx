'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { projectsAPI } from '@/lib/api'
import { EXPANDED_PROJECT_TYPES } from '../../constants/projectTypes'
import { 
  ArrowLeftIcon,
  CodeBracketIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
  CubeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface Project {
  id: string
  title: string
  description?: string
  type: string
  status: string
  budget?: number
  startDate?: string
  endDate?: string
  estimatedHours?: number
  actualHours: number
  completionPercentage: number
  client?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

const getProjectIcon = (type: string) => {
  const projectType = EXPANDED_PROJECT_TYPES.find(pt => pt.value === type)
  if (projectType) {
    return <span className="text-2xl">{projectType.label.charAt(0)}</span>
  }
  
  // Fallback icons based on type
  switch (type) {
    case 'website':
    case 'web_app':
      return <GlobeAltIcon className="h-6 w-6" />
    case 'mobile_app':
    case 'ios_app':
    case 'android_app':
      return <DeviceTabletIcon className="h-6 w-6" />
    case 'api':
    case 'microservices':
      return <CodeBracketIcon className="h-6 w-6" />
    case 'dashboard':
      return <ChartBarIcon className="h-6 w-6" />
    default:
      return <CubeIcon className="h-6 w-6" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'planning':
      return 'bg-gray-100 text-gray-800'
    case 'review':
      return 'bg-amber-100 text-amber-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await projectsAPI.getProjects()
      setProjects(data || [])
    } catch (err: any) {
      setError('Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const statusMatch = filter === 'all' || project.status === filter
    const typeMatch = typeFilter === 'all' || project.type === typeFilter
    return statusMatch && typeMatch
  })

  const completedProjects = projects.filter(p => p.status === 'completed')
  const inProgressProjects = projects.filter(p => p.status === 'in_progress')
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)

  const projectTypes = Array.from(new Set(projects.map(p => p.type)))
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.status)))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Walter Katuruza - Portfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Full-stack software developer specializing in modern web technologies, 
            mobile applications, and scalable backend systems. Passionate about creating 
            innovative solutions that drive business growth.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/waltergkaturuza" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View GitHub
            </a>
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Me
            </a>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{projects.length}</div>
            <div className="text-gray-600">Total Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{completedProjects.length}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-2">{inProgressProjects.length}</div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{formatCurrency(totalBudget)}</div>
            <div className="text-gray-600">Total Value</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by:</span>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {projectTypes.map(type => {
                const projectType = EXPANDED_PROJECT_TYPES.find(pt => pt.value === type)
                return (
                  <option key={type} value={type}>
                    {projectType ? projectType.label : type}
                  </option>
                )
              })}
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Projects {filteredProjects.length !== projects.length && `(${filteredProjects.length} of ${projects.length})`}
          </h2>
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No projects found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => {
                const projectType = EXPANDED_PROJECT_TYPES.find(pt => pt.value === project.type)
                
                return (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="text-white text-6xl opacity-20">
                        {getProjectIcon(project.type)}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{project.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {projectType ? projectType.label : project.type}
                        </span>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        {project.client && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <UserIcon className="h-4 w-4" />
                            <span>{project.client.firstName} {project.client.lastName}</span>
                          </div>
                        )}
                        
                        {project.budget && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            <span>{formatCurrency(project.budget)}</span>
                          </div>
                        )}
                        
                        {project.estimatedHours && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4" />
                            <span>{project.estimatedHours}h estimated</span>
                          </div>
                        )}
                        
                        {project.endDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Due: {new Date(project.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(project.completionPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="flex-1 text-center bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}/tracking`}
                          className="flex-1 text-center border border-gray-300 text-gray-700 text-sm px-3 py-2 rounded hover:bg-gray-50 transition-colors"
                        >
                          Track Progress
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Skills and Technologies Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technical Expertise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CodeBracketIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full-Stack Development</h3>
              <p className="text-gray-600 text-sm">
                End-to-end development from database design to user interface implementation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Web Applications</h3>
              <p className="text-gray-600 text-sm">
                Modern web applications using React, Next.js, NestJS, and other cutting-edge technologies.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DeviceTabletIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Development</h3>
              <p className="text-gray-600 text-sm">
                Cross-platform mobile applications for iOS and Android using React Native and Flutter.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Solutions</h3>
              <p className="text-gray-600 text-sm">
                Scalable enterprise applications with robust security and performance optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Let's Work Together</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Ready to bring your ideas to life? I'm available for new projects and collaborations. 
            Let's discuss how we can create something amazing together.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get In Touch
            </a>
            <Link
              href="/contact"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Form
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Walter Katuruza - Portfolio
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Full-stack software developer specializing in modern web technologies, 
            mobile applications, and scalable backend systems. Passionate about creating 
            innovative solutions that drive business growth.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/waltergkaturuza" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              View GitHub
            </a>
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technical Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skillGroup, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.technologies.map((tech, techIndex) => (
                    <span 
                      key={techIndex}
                      className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-white text-6xl opacity-20">
                    {project.icon}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {project.github && (
                      <a 
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-gray-900 text-white text-sm px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                      >
                        GitHub
                      </a>
                    )}
                    {project.demo && (
                      <a 
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Experience & Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CodeBracketIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clean Code</h3>
              <p className="text-gray-600 text-sm">
                Writing maintainable, scalable, and well-documented code following industry best practices.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <GlobeAltIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Full-Stack</h3>
              <p className="text-gray-600 text-sm">
                End-to-end development from database design to user interface implementation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DevicePhoneIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile First</h3>
              <p className="text-gray-600 text-sm">
                Responsive design and mobile application development for all platforms.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
              <p className="text-gray-600 text-sm">
                Optimized applications with focus on speed, scalability, and user experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-white rounded-lg shadow-sm border p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Work Together</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ready to bring your project to life? Let's discuss how I can help you build 
            something amazing with cutting-edge technology and best practices.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="mailto:walter.katuruza@grinitetech.com"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start a Project
            </a>
            <Link 
              href="/dashboard"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}