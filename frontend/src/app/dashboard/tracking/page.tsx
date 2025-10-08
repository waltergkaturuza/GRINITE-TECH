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

// Modal Components
interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (task: Partial<Task>) => void
  task?: Task | null
}

const TaskModal = ({ isOpen, onClose, onSubmit, task }: TaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    assignedTo: '',
    assignedToName: '',
    startDate: '',
    endDate: '',
    progress: 0
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        assignedToName: task.assignedToName,
        startDate: task.startDate,
        endDate: task.endDate,
        progress: task.progress
      })
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        assignedToName: '',
        startDate: '',
        endDate: '',
        progress: 0
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {task ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              value={formData.assignedToName}
              onChange={(e) => setFormData({ 
                ...formData, 
                assignedToName: e.target.value,
                assignedTo: e.target.value // For simplicity, use same value for both
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter team member name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress ({formData.progress}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface TeamMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (member: Partial<Resource>) => void
}

const TeamMemberModal = ({ isOpen, onClose, onSubmit }: TeamMemberModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    availability: 100,
    allocatedHours: 0,
    usedHours: 0,
    hourlyRate: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
    setFormData({
      name: '',
      role: '',
      availability: 100,
      allocatedHours: 0,
      usedHours: 0,
      hourlyRate: 0
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Team Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocated Hours
              </label>
              <input
                type="number"
                min="0"
                value={formData.allocatedHours}
                onChange={(e) => setFormData({ ...formData, allocatedHours: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Used Hours
              </label>
              <input
                type="number"
                min="0"
                value={formData.usedHours}
                onChange={(e) => setFormData({ ...formData, usedHours: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Team Member
            </button>
          </div>
        </form>
      </div>
    </div>
  )
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
  
  // Modal states for management
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditingTask, setIsEditingTask] = useState<Task | null>(null)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  
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

  // Task Management Functions
  const handleAddTask = (taskData: Partial<Task>) => {
    if (!selectedProject) return
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      assignedTo: taskData.assignedTo || '',
      assignedToName: taskData.assignedToName || '',
      startDate: taskData.startDate || new Date().toISOString(),
      endDate: taskData.endDate || new Date().toISOString(),
      progress: taskData.progress || 0,
      dependencies: taskData.dependencies || [],
      comments: [],
      priority: taskData.priority || 'medium'
    }
    
    const updatedProject = {
      ...selectedProject,
      tasks: [...selectedProject.tasks, newTask]
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
    setIsTaskModalOpen(false)
  }

  const handleEditTask = (taskData: Partial<Task>) => {
    if (!selectedProject || !isEditingTask) return
    
    const updatedTask = { ...isEditingTask, ...taskData }
    const updatedProject = {
      ...selectedProject,
      tasks: selectedProject.tasks.map(task => 
        task.id === isEditingTask.id ? updatedTask : task
      )
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
    setIsTaskModalOpen(false)
    setIsEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    if (!selectedProject) return
    
    const updatedProject = {
      ...selectedProject,
      tasks: selectedProject.tasks.filter(task => task.id !== taskId)
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    if (!selectedProject) return
    
    const updatedProject = {
      ...selectedProject,
      tasks: selectedProject.tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
  }

  // Team Management Functions
  const handleAddTeamMember = (memberData: Partial<Resource>) => {
    if (!selectedProject) return
    
    const newResource: Resource = {
      id: `res-${Date.now()}`,
      name: memberData.name || '',
      role: memberData.role || '',
      allocatedHours: memberData.allocatedHours || 0,
      usedHours: memberData.usedHours || 0,
      hourlyRate: memberData.hourlyRate || 0,
      availability: memberData.availability || 100
    }
    
    const updatedProject = {
      ...selectedProject,
      resources: [...selectedProject.resources, newResource],
      teamMembers: [...selectedProject.teamMembers, memberData.name || '']
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
    setIsTeamModalOpen(false)
  }

  // Risk Management Functions
  const handleAddRisk = (riskData: Partial<Risk>) => {
    if (!selectedProject) return
    
    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      title: riskData.title || '',
      description: riskData.description || '',
      likelihood: riskData.likelihood || 'medium',
      impact: riskData.impact || 'medium',
      status: riskData.status || 'open',
      mitigationPlan: riskData.mitigationPlan || '',
      assignedTo: riskData.assignedTo || ''
    }
    
    const updatedProject = {
      ...selectedProject,
      risks: [...selectedProject.risks, newRisk]
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
    setIsRiskModalOpen(false)
  }

  // Issue Management Functions
  const handleAddIssue = (issueData: Partial<Issue>) => {
    if (!selectedProject) return
    
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      title: issueData.title || '',
      description: issueData.description || '',
      severity: issueData.severity || 'medium',
      status: issueData.status || 'open',
      reportedBy: issueData.reportedBy || 'current-user',
      assignedTo: issueData.assignedTo || '',
      dateRaised: new Date().toISOString()
    }
    
    const updatedProject = {
      ...selectedProject,
      issues: [...selectedProject.issues, newIssue]
    }
    
    setSelectedProject(updatedProject)
    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p))
    setIsIssueModalOpen(false)
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

        {/* Show project list if no project selected */}
        {!selectedProject ? (
          <>
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
          </>
        ) : (
          /* Detailed Project View */
          <div className="space-y-6">
            {/* Project Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
                  {getStatusBadge(selectedProject.status)}
                  {getPriorityBadge(selectedProject.priority)}
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                    <PencilIcon className="w-4 h-4 inline mr-2" />
                    Edit Project
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{selectedProject.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Client:</span>
                  <p className="font-medium">
                    {selectedProject.client ? `${selectedProject.client.firstName} ${selectedProject.client.lastName}` : 'No client assigned'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <p className="font-medium">${(selectedProject.budget || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Progress:</span>
                  <p className="font-medium">{selectedProject.completionPercentage}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{selectedProject.endDate ? formatDate(selectedProject.endDate) : 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'overview', label: 'Overview', icon: FolderIcon },
                    { id: 'tasks', label: 'Tasks & Milestones', icon: ClipboardDocumentListIcon },
                    { id: 'resources', label: 'Team & Resources', icon: UsersIcon },
                    { id: 'risks', label: 'Risks & Issues', icon: ExclamationTriangleIcon },
                    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'tasks' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Tasks & Milestones</h3>
                      <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        <PlusIcon className="w-4 h-4 inline mr-2" />
                        Add Task
                      </button>
                    </div>

                    {selectedProject.tasks.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProject.tasks.map((task) => (
                          <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getTaskStatusBadge(task.status)}
                                <button
                                  onClick={() => {
                                    setIsEditingTask(task)
                                    setIsTaskModalOpen(true)
                                  }}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">Assigned to:</span>
                                <p className="font-medium">{task.assignedToName}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Priority:</span>
                                <p className="font-medium capitalize">{task.priority}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Start Date:</span>
                                <p className="font-medium">{formatDate(task.startDate)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Due Date:</span>
                                <p className="font-medium">{formatDate(task.endDate)}</p>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-gray-900">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Quick Status Update */}
                            <div className="flex space-x-2">
                              <span className="text-sm text-gray-500">Quick update:</span>
                              {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                                <button
                                  key={status}
                                  onClick={() => handleUpdateTaskStatus(task.id, status as Task['status'])}
                                  className={`px-2 py-1 rounded text-xs ${
                                    task.status === status
                                      ? config.color
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {config.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by adding your first task or milestone.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Team & Resources</h3>
                      <button
                        onClick={() => setIsTeamModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        <PlusIcon className="w-4 h-4 inline mr-2" />
                        Add Team Member
                      </button>
                    </div>

                    {selectedProject.resources.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProject.resources.map((resource) => (
                          <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{resource.name}</h4>
                                <p className="text-sm text-gray-600">{resource.role}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                resource.availability >= 80 ? 'bg-green-100 text-green-800' :
                                resource.availability >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {resource.availability}% Available
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Allocated:</span>
                                <p className="font-medium">{resource.allocatedHours}h</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Used:</span>
                                <p className="font-medium">{resource.usedHours}h</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Rate:</span>
                                <p className="font-medium">${resource.hourlyRate}/hr</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Total Cost:</span>
                                <p className="font-medium">${(resource.usedHours * resource.hourlyRate).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No team members assigned</h3>
                        <p className="mt-1 text-sm text-gray-500">Add team members to track resource allocation and costs.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Add other tab content here */}
                {activeTab === 'overview' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Project overview coming soon...</p>
                  </div>
                )}
                
                {activeTab === 'risks' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Risk management coming soon...</p>
                  </div>
                )}
                
                {activeTab === 'analytics' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Analytics dashboard coming soon...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false)
            setIsEditingTask(null)
          }}
          onSubmit={isEditingTask ? handleEditTask : handleAddTask}
          task={isEditingTask}
        />
      )}

      {/* Team Member Modal */}
      {isTeamModalOpen && (
        <TeamMemberModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          onSubmit={handleAddTeamMember}
        />
      )}
    </div>
  )
}