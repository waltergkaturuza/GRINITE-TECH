'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '../components/Navigation'
import { 
  BriefcaseIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { projectsAPI, authAPI, dashboardAPI } from '../../lib/api'

interface Project {
  id: string
  title: string
  description: string
  status: string
  completionPercentage: number
  endDate: string
  updatedAt: string
  client?: {
    firstName: string
    lastName: string
    email: string
  }
  estimatedHours?: number
  actualHours?: number
  budget?: number
}

interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRevenue?: number
  monthlyRevenue?: number
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  createdAt: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action handlers
  const handleCreateProject = () => {
    router.push('/dashboard/projects?action=create')
  }

  const handleViewAllProjects = () => {
    router.push('/dashboard/projects')
  }

  const handleProjectAction = (projectId: string, action: string) => {
    if (action === 'view') {
      router.push(`/dashboard/projects?id=${projectId}`)
    } else if (action === 'edit') {
      router.push(`/dashboard/projects?id=${projectId}&action=edit`)
    }
  }

  const handleUploadFiles = () => {
    // Placeholder for file upload functionality
    alert('File upload functionality will be implemented soon!')
  }

  const handleContactTeam = () => {
    // Placeholder for team contact functionality
    alert('Team messaging functionality will be implemented soon!')
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load user profile
      const userProfile = await authAPI.getProfile()
      setUser(userProfile)

      // Load projects - get user's projects if client, all projects if admin
      const projectsResponse = await projectsAPI.getProjects({ 
        limit: 20,
        clientId: userProfile.role === 'client' ? userProfile.id : undefined
      })
      const userProjects = projectsResponse.projects || projectsResponse.data || []
      setProjects(userProjects)
      
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0])
      }

      // Calculate stats from projects data
      const totalProjects = userProjects.length
      const activeProjects = userProjects.filter((p: Project) => 
        p.status === 'in_progress' || p.status === 'planning'
      ).length
      const completedProjects = userProjects.filter((p: Project) => 
        p.status === 'completed'
      ).length

      setStats({
        totalProjects,
        activeProjects,
        completedProjects
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'on_hold':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-granite-100 text-granite-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'in_progress':
        return <ClockIcon className="h-5 w-5" />
      case 'planning':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      default:
        return <ClockIcon className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusDisplayName = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      case 'planning':
        return 'Planning'
      case 'on_hold':
        return 'On Hold'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crimson-900 mx-auto"></div>
            <p className="mt-4 text-granite-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
        <Navigation />
        <div className="wide-container px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      <div className="wide-container px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-granite-800 mb-2">
            Welcome back, {user.firstName} {user.lastName}!
          </h1>
          <p className="text-granite-600">Manage your projects and track progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center">
              <div className="bg-crimson-100 p-3 rounded-lg">
                <BriefcaseIcon className="h-6 w-6 text-crimson-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-granite-600">Total Projects</p>
                <p className="text-2xl font-bold text-granite-800">{stats?.totalProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-granite-600">Active Projects</p>
                <p className="text-2xl font-bold text-granite-800">{stats?.activeProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-granite-600">Completed</p>
                <p className="text-2xl font-bold text-granite-800">{stats?.completedProjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-granite-600">Member Since</p>
                <p className="text-lg font-bold text-granite-800">
                  {formatJoinDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-granite-800">Your Projects</h2>
                <button 
                  onClick={handleCreateProject}
                  className="bg-crimson-600 hover:bg-crimson-700 text-white p-2 rounded-lg transition-colors duration-200"
                  title="Create New Project"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <BriefcaseIcon className="h-12 w-12 text-granite-400 mx-auto mb-4" />
                  <p className="text-granite-600 mb-4">No projects found</p>
                  <button 
                    onClick={handleCreateProject}
                    className="bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Start Your First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedProject?.id === project.id
                          ? 'border-crimson-200 bg-crimson-50'
                          : 'border-granite-200 bg-white hover:border-granite-300'
                      }`}
                    >
                      <h3 className="font-medium text-granite-800 truncate">{project.title}</h3>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(project.status)}`}>
                        {getStatusDisplayName(project.status)}
                      </span>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm text-granite-600 mb-1">
                          <span>Progress</span>
                          <span>{project.completionPercentage || 0}% complete</span>
                        </div>
                        <div className="w-full bg-granite-200 rounded-full h-2">
                          <div
                            className="bg-crimson-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.completionPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between text-xs text-granite-500">
                        <span>{project.completionPercentage || 0}% complete</span>
                        <span>Due: {formatDate(project.endDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {!selectedProject ? (
              <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-8">
                <div className="text-center">
                  <BriefcaseIcon className="h-16 w-16 text-granite-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-granite-800 mb-2">No Project Selected</h3>
                  <p className="text-granite-600">Select a project from the list to view details</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-granite-800">{selectedProject.title}</h2>
                    <p className="text-granite-600 mt-1">{selectedProject.description}</p>
                    <div className="mt-3 flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(selectedProject.status)}`}>
                        {getStatusIcon(selectedProject.status)}
                        <span className="ml-2">{getStatusDisplayName(selectedProject.status)}</span>
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleProjectAction(selectedProject.id, 'view')}
                    className="text-granite-400 hover:text-granite-600"
                    title="View Project Details"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm text-granite-600 mb-2">
                    <span>Progress</span>
                    <span>{selectedProject.completionPercentage || 0}% complete</span>
                  </div>
                  <div className="w-full bg-granite-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-crimson-500 to-crimson-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${selectedProject.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-granite-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', name: 'Overview', icon: DocumentIcon },
                      { id: 'files', name: 'Files', icon: DocumentIcon },
                      { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon },
                      { id: 'settings', name: 'Settings', icon: CogIcon }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'border-crimson-500 text-crimson-600'
                            : 'border-transparent text-granite-500 hover:text-granite-700 hover:border-granite-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'overview' && (
                    <div>
                      <h3 className="font-semibold text-granite-800 mb-4">Project Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-granite-600">Deadline:</span>
                            <span className="text-granite-800">{formatDate(selectedProject.endDate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-granite-600">Last Update:</span>
                            <span className="text-granite-800">{formatDate(selectedProject.updatedAt)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-granite-600">Client:</span>
                            <span className="text-granite-800">
                              {selectedProject.client
                                ? `${selectedProject.client.firstName} ${selectedProject.client.lastName}`
                                : 'Not assigned'
                              }
                            </span>
                          </div>
                          {selectedProject.budget && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-granite-600">Budget:</span>
                              <span className="text-granite-800">
                                ${selectedProject.budget.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {selectedProject.estimatedHours && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-granite-600">Estimated Hours:</span>
                              <span className="text-granite-800">{selectedProject.estimatedHours}h</span>
                            </div>
                          )}
                          {selectedProject.actualHours && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-granite-600">Actual Hours:</span>
                              <span className="text-granite-800">{selectedProject.actualHours}h</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                        <p className="text-blue-700 text-sm">
                          Continue working on the current phase. Check with the team for any blockers.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'files' && (
                    <div>
                      <h3 className="font-semibold text-granite-800 mb-4">Project Files</h3>
                      
                      <div className="bg-gradient-to-r from-granite-50 to-granite-100 border border-granite-200 rounded-lg p-6 text-center">
                        <DocumentIcon className="h-12 w-12 text-granite-400 mx-auto mb-4" />
                        <p className="text-granite-600 mb-4">File management coming soon!</p>
                        <button 
                          onClick={handleUploadFiles}
                          className="bg-crimson-600 hover:bg-crimson-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                          Upload Files
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'messages' && (
                    <div>
                      <h3 className="font-semibold text-granite-800 mb-4">Project Messages</h3>
                      
                      <div className="bg-gradient-to-r from-granite-50 to-granite-100 border border-granite-200 rounded-lg p-6 text-center">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 text-granite-400 mx-auto mb-4" />
                        <p className="text-granite-600 mb-4">Message center coming soon!</p>
                        <button 
                          onClick={handleContactTeam}
                          className="bg-crimson-600 hover:bg-crimson-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Contact Team
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div>
                      <h3 className="font-semibold text-granite-800 mb-4">Project Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="border border-granite-200 rounded-lg p-4">
                          <h4 className="font-medium text-granite-800 mb-2">Notifications</h4>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                              <span className="ml-2 text-sm text-granite-700">Email updates</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                              <span className="ml-2 text-sm text-granite-700">Milestone notifications</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                              <span className="ml-2 text-sm text-granite-700">Weekly reports</span>
                            </label>
                          </div>
                        </div>
                        
                        <div className="border border-granite-200 rounded-lg p-4">
                          <h4 className="font-medium text-granite-800 mb-2">Privacy</h4>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input type="checkbox" defaultChecked className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                              <span className="ml-2 text-sm text-granite-700">Share progress with team</span>
                            </label>
                            <label className="flex items-center">
                              <input type="checkbox" className="rounded border-granite-300 text-crimson-600 focus:ring-crimson-500" />
                              <span className="ml-2 text-sm text-granite-700">Allow external access</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}