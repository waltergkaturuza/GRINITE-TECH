'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { projectsAPI } from '@/lib/api'
import { 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  BellIcon,
  DocumentIcon,
  ChatBubbleLeftEllipsisIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  BugAntIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

// Backend API Types
interface Project {
  id: string
  title: string
  description?: string
  type: string
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'cancelled'
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
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

interface Milestone {
  id: string
  name: string
  description?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  orderIndex: number
  progress: number
  dueDate?: string
  estimatedHours?: number
  createdAt: string
  updatedAt: string
}

// Extended types for tracking
interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'ongoing' | 'done' | 'blocked'
  assignedTo: string
  assignedToName: string
  startDate: string
  endDate: string
  progress: number
  dependencies: string[]
  comments: Comment[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface Comment {
  id: string
  author: string
  message: string
  timestamp: string
  mentions?: string[]
}

interface Resource {
  id: string
  name: string
  role: string
  allocatedHours: number
  usedHours: number
  hourlyRate: number
  availability: number // percentage
}

interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  category: 'materials' | 'labor' | 'software' | 'other'
}

interface Risk {
  id: string
  title: string
  description: string
  likelihood: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  status: 'open' | 'mitigated' | 'closed'
  mitigationPlan: string
  assignedTo: string
}

interface Issue {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  reportedBy: string
  assignedTo: string
  dateRaised: string
  dateResolved?: string
}

// Enhanced project interface for tracking
interface ProjectTrackingData {
  id: string
  title: string
  description?: string
  type: string
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
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
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  spentBudget: number
  lastUpdate: string
  tasks: Task[]
  resources: Resource[]
  budgetBreakdown: BudgetCategory[]
  risks: Risk[]
  issues: Issue[]
  documents: any[]
  teamMembers: string[]
}

const STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800', icon: FolderIcon },
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: PlayIcon },
  paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: PauseIcon },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: StopIcon },
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationCircleIcon },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: ExclamationTriangleIcon },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
}

const TASK_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
  ongoing: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: PlayIcon },
  done: { label: 'Done', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon },
}

export default function ProjectTrackingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id')

  const [projects, setProjects] = useState<ProjectTrackingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectTrackingData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'resources' | 'budget' | 'risks' | 'issues' | 'documents' | 'timeline' | 'analytics'>('overview')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })

  useEffect(() => {
    loadProjects()
  }, [filters])

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
      }
    }
  }, [projectId, projects])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get projects from API
      const response = await projectsAPI.getProjects({
        status: filters.status || undefined,
        search: filters.search || undefined
      })
      
      // Transform projects to include tracking data
      const projectsWithTracking: ProjectTrackingData[] = response.data.map((project: Project) => ({
        ...project,
        // Convert backend status to frontend status
        status: mapBackendStatus(project.status),
        // Set default priority if not available
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        // Calculate spent budget (this would ideally come from backend)
        spentBudget: Math.round((project.budget || 0) * (project.completionPercentage / 100)),
        lastUpdate: project.updatedAt,
        // Initialize empty arrays for now - these would come from additional API calls
        tasks: project.milestones?.map(milestone => ({
          id: milestone.id,
          title: milestone.name,
          description: milestone.description || '',
          status: mapMilestoneStatus(milestone.status),
          assignedTo: 'team-member',
          assignedToName: 'Team Member',
          startDate: project.startDate || new Date().toISOString(),
          endDate: milestone.dueDate || project.endDate || new Date().toISOString(),
          progress: milestone.progress,
          dependencies: [],
          comments: [],
          priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
        })) || [],
        resources: [],
        budgetBreakdown: project.budget ? [
          {
            id: '1',
            name: 'Development',
            allocated: Math.round(project.budget * 0.7),
            spent: Math.round((project.budget || 0) * 0.7 * (project.completionPercentage / 100)),
            category: 'labor' as 'materials' | 'labor' | 'software' | 'other'
          },
          {
            id: '2',
            name: 'Tools & Software',
            allocated: Math.round(project.budget * 0.2),
            spent: Math.round((project.budget || 0) * 0.2 * (project.completionPercentage / 100)),
            category: 'software' as 'materials' | 'labor' | 'software' | 'other'
          },
          {
            id: '3',
            name: 'Other Expenses',
            allocated: Math.round(project.budget * 0.1),
            spent: Math.round((project.budget || 0) * 0.1 * (project.completionPercentage / 100)),
            category: 'other' as 'materials' | 'labor' | 'software' | 'other'
          }
        ] : [],
        risks: [],
        issues: [],
        documents: [],
        teamMembers: []
      }))
      
      setProjects(projectsWithTracking)
    } catch (error) {
      console.error('Error loading projects:', error)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to map backend status to frontend status
  const mapBackendStatus = (status: string): 'planning' | 'active' | 'paused' | 'completed' | 'cancelled' => {
    switch (status) {
      case 'planning': return 'planning'
      case 'in_progress': return 'active'
      case 'review': return 'active'
      case 'completed': return 'completed'
      case 'cancelled': return 'cancelled'
      default: return 'planning'
    }
  }

  // Helper function to map milestone status to task status
  const mapMilestoneStatus = (status: string): 'pending' | 'ongoing' | 'done' | 'blocked' => {
    switch (status) {
      case 'not_started': return 'pending'
      case 'in_progress': return 'ongoing'
      case 'completed': return 'done'
      case 'blocked': return 'blocked'
      default: return 'pending'
    }
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    const IconComponent = config?.icon || ClockIcon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config?.label || status}
      </span>
    )
  }

  const getTaskStatusBadge = (status: string) => {
    const config = TASK_STATUS_CONFIG[status as keyof typeof TASK_STATUS_CONFIG]
    const IconComponent = config?.icon || ClockIcon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config?.label || status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const config = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]
    const IconComponent = config?.icon || ClockIcon
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config?.label || priority}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (actual: number, estimated: number) => {
    if (estimated === 0) return 0
    return Math.min((actual / estimated) * 100, 100)
  }

  const navigateToProject = (project: ProjectTrackingData) => {
    setSelectedProject(project)
    router.push(`/dashboard/tracking?id=${project.id}`)
  }

  // ... (include all the render functions from the previous implementation)

  const filteredProjects = projects.filter(project => {
    return (
      (!filters.status || project.status === filters.status) &&
      (!filters.priority || project.priority === filters.priority) &&
      (!filters.search || 
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        `${project.client?.firstName || ''} ${project.client?.lastName || ''}`.toLowerCase().includes(filters.search.toLowerCase())
      )
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project tracking data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Tracking</h1>
          <p className="mt-2 text-gray-600">Monitor project progress, timelines, and budgets</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PlayIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Budget</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${projects.reduce((sum, p) => sum + (p.budget || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search projects or clients..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', priority: '', search: '' })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-500">
                          {project.client ? `${project.client.firstName} ${project.client.lastName}` : 'No client assigned'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(project.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{project.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.startDate ? formatDate(project.startDate) : 'No start date'} - {project.endDate ? formatDate(project.endDate) : 'No end date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${project.spentBudget.toLocaleString()} / ${(project.budget || 0).toLocaleString()}
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{ width: `${Math.min((project.spentBudget / (project.budget || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigateToProject(project)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status || filters.priority || filters.search 
                  ? 'Try adjusting your filters.' 
                  : 'No projects are currently being tracked.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}