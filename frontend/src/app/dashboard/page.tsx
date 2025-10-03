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

// Mock project data
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Website',
    status: 'In Progress',
    progress: 65,
    deadline: '2024-02-15',
    lastUpdate: '2024-01-20',
    description: 'Full-featured e-commerce platform with payment integration',
    team: ['John Smith', 'Sarah Johnson'],
    files: [
      { name: 'Design Mockups.pdf', size: '2.4 MB', uploaded: '2024-01-18' },
      { name: 'Technical Specs.docx', size: '1.2 MB', uploaded: '2024-01-20' }
    ],
    messages: 12,
    nextMilestone: 'Frontend Development Complete'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    status: 'Planning',
    progress: 25,
    deadline: '2024-03-30',
    lastUpdate: '2024-01-19',
    description: 'Cross-platform mobile application for iOS and Android',
    team: ['Mike Chen', 'Lisa Rodriguez'],
    files: [
      { name: 'Requirements.pdf', size: '1.8 MB', uploaded: '2024-01-15' }
    ],
    messages: 8,
    nextMilestone: 'UI/UX Design Phase'
  },
  {
    id: '3',
    name: 'API Integration',
    status: 'Completed',
    progress: 100,
    deadline: '2024-01-10',
    lastUpdate: '2024-01-10',
    description: 'RESTful API development and third-party integrations',
    team: ['David Park'],
    files: [
      { name: 'API Documentation.pdf', size: '3.1 MB', uploaded: '2024-01-10' },
      { name: 'Integration Guide.docx', size: '2.2 MB', uploaded: '2024-01-10' }
    ],
    messages: 15,
    nextMilestone: 'Project Delivered'
  }
]

// Mock user data
const mockUser = {
  name: 'Alex Thompson',
  email: 'alex@example.com',
  company: 'Tech Innovations Inc.',
  joinDate: '2023-11-15',
  totalProjects: 6,
  activeProjects: 2,
  completedProjects: 4
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(mockUser)
  const [projects, setProjects] = useState(mockProjects)
  const [selectedProject, setSelectedProject] = useState(mockProjects[0])
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000)
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-granite-100 text-granite-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'In Progress':
        return <ClockIcon className="h-5 w-5" />
      case 'Planning':
        return <ExclamationTriangleIcon className="h-5 w-5" />
      default:
        return <ClockIcon className="h-5 w-5" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-50 via-white to-granite-100">
      <Navigation />

      <div className="wide-container px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-granite-800 mb-2">
            Welcome back, {user.name}!
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
                <p className="text-2xl font-bold text-granite-800">{user.totalProjects}</p>
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
                <p className="text-2xl font-bold text-granite-800">{user.activeProjects}</p>
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
                <p className="text-2xl font-bold text-granite-800">{user.completedProjects}</p>
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
                  {new Date(user.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-granite-800">Your Projects</h2>
                <button className="bg-crimson-600 hover:bg-crimson-700 text-white p-2 rounded-lg transition-colors duration-200">
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProject.id === project.id
                        ? 'border-crimson-200 bg-crimson-50'
                        : 'border-granite-200 hover:border-granite-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-granite-800 truncate">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{project.status}</span>
                      </span>
                    </div>
                    
                    <div className="w-full bg-granite-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-crimson-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-granite-500">
                      <span>{project.progress}% complete</span>
                      <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-granite-200 p-6">
              {/* Project Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-granite-800">{selectedProject.name}</h2>
                  <p className="text-granite-600 mt-1">{selectedProject.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(selectedProject.status)}`}>
                  {getStatusIcon(selectedProject.status)}
                  <span className="ml-2">{selectedProject.status}</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-granite-600 mb-2">
                  <span>Progress</span>
                  <span>{selectedProject.progress}% complete</span>
                </div>
                <div className="w-full bg-granite-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-crimson-600 to-crimson-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${selectedProject.progress}%` }}
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-granite-200 mb-6">
                <div className="flex space-x-8">
                  {[
                    { id: 'overview', name: 'Overview', icon: BriefcaseIcon },
                    { id: 'files', name: 'Files', icon: DocumentIcon },
                    { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon },
                    { id: 'settings', name: 'Settings', icon: CogIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 border-b-2 transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'border-crimson-600 text-crimson-600'
                          : 'border-transparent text-granite-500 hover:text-granite-700'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 mr-2" />
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-granite-800 mb-3">Project Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-granite-600">Deadline:</span>
                          <span className="text-granite-800">{new Date(selectedProject.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-granite-600">Last Update:</span>
                          <span className="text-granite-800">{new Date(selectedProject.lastUpdate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-granite-600">Team Size:</span>
                          <span className="text-granite-800">{selectedProject.team.length} members</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-granite-600">Files:</span>
                          <span className="text-granite-800">{selectedProject.files.length} files</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-granite-800 mb-3">Team Members</h3>
                      <div className="space-y-2">
                        {selectedProject.team.map((member, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-8 h-8 bg-crimson-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {member.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="ml-3 text-granite-800">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-granite-800 mb-3">Next Milestone</h3>
                    <div className="bg-gradient-to-r from-crimson-50 to-crimson-100 border border-crimson-200 rounded-lg p-4">
                      <p className="text-crimson-800 font-medium">{selectedProject.nextMilestone}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-granite-800">Project Files</h3>
                    <button className="bg-crimson-600 hover:bg-crimson-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                      Upload File
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedProject.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-granite-200 rounded-lg hover:bg-granite-50 transition-colors duration-200">
                        <div className="flex items-center">
                          <DocumentIcon className="h-6 w-6 text-granite-400 mr-3" />
                          <div>
                            <p className="font-medium text-granite-800">{file.name}</p>
                            <p className="text-sm text-granite-500">{file.size} • Uploaded {new Date(file.uploaded).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-granite-500 hover:text-granite-700 transition-colors duration-200">
                            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-granite-500 hover:text-granite-700 transition-colors duration-200">
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-granite-800">Project Messages</h3>
                    <span className="bg-crimson-100 text-crimson-800 px-2 py-1 rounded-full text-sm font-medium">
                      {selectedProject.messages} messages
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-granite-50 to-granite-100 border border-granite-200 rounded-lg p-6 text-center">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-granite-400 mx-auto mb-4" />
                    <p className="text-granite-600 mb-4">Message center coming soon!</p>
                    <button className="bg-crimson-600 hover:bg-crimson-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
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
        </div>
      </div>
    </div>
  )
}