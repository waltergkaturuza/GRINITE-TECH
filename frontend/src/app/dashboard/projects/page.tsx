'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { projectsAPI, usersAPI, hostingExpensesAPI } from '@/lib/api'
import { EXPANDED_PROJECT_TYPES, PROJECT_CATEGORIES } from '../../../constants/projectTypes'
import Link from 'next/link'
import { 
  FolderIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  EyeIcon,
  ServerStackIcon
} from '@heroicons/react/24/outline'
import CreateEditProjectForm from './CreateEditProjectForm'
import ProjectDetailsModal from '../tracking/ProjectDetailsModal'

// Types
interface Project {
  id: string
  title: string
  description?: string
  type: string
  status: string
  budget?: number
  totalBudget?: number
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

interface ProjectStats {
  total: number
  planning: number
  inProgress: number
  review: number
  completed: number
  cancelled: number
  totalBudget: number
  totalActualHours: number
  averageCompletion: number
}

const PROJECT_TYPES = EXPANDED_PROJECT_TYPES;

const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'Review', color: 'bg-amber-200 text-amber-900' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
]

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [stats, setStats] = useState<ProjectStats>({
    total: 0,
    planning: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    cancelled: 0,
    totalBudget: 0,
    totalActualHours: 0,
    averageCompletion: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [hostingByProject, setHostingByProject] = useState<Record<string, number>>({})

  // Load data
  useEffect(() => {
    loadProjects()
    loadClients()
  }, [searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    loadHostingStats()
  }, [])

  const [totalHostingCost, setTotalHostingCost] = useState(0)

  const loadHostingStats = async () => {
    try {
      const res = await hostingExpensesAPI.getStats()
      const map: Record<string, number> = {}
      for (const p of res?.byProject || []) {
        if (p.projectId) map[p.projectId] = p.total
      }
      setHostingByProject(map)
      setTotalHostingCost(res?.totalAmount ?? 0)
    } catch {
      setHostingByProject({})
      setTotalHostingCost(0)
    }
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter

      const response: any = await projectsAPI.getProjects(params)

      // Normalise backend shape: support {success,data}, {projects}, or raw array
      const list: Project[] = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.projects)
        ? response.projects
        : Array.isArray(response)
        ? response
        : []

      setProjects(list)

      // Calculate stats from loaded projects
      const projectStats = calculateStats(list)
      setStats(projectStats)
    } catch (error) {
      console.error('Error loading projects:', error)
      setProjects([])
      setStats({
        total: 0,
        planning: 0,
        inProgress: 0,
        review: 0,
        completed: 0,
        cancelled: 0,
        totalBudget: 0,
        totalActualHours: 0,
        averageCompletion: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const response: any = await usersAPI.getUsers({ role: 'client' })
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      setClients(list)
    } catch (error) {
      console.error('Error loading clients:', error)
      setClients([])
    }
  }

  const calculateStats = (projectsData: Project[]): ProjectStats => {
    const total = projectsData.length
    const planning = projectsData.filter(p => p.status === 'planning').length
    const inProgress = projectsData.filter(p => p.status === 'in_progress').length
    const review = projectsData.filter(p => p.status === 'review').length
    const completed = projectsData.filter(p => p.status === 'completed').length
    const cancelled = projectsData.filter(p => p.status === 'cancelled').length
    const toNum = (v: unknown): number => {
      if (v == null || v === '') return 0
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }
    const totalBudget = projectsData.reduce(
      (sum, p) => sum + toNum(p.budget ?? p.totalBudget),
      0
    )
    const totalActualHours = projectsData.reduce((sum, p) => sum + toNum(p.actualHours), 0)
    const averageCompletion =
      total > 0
        ? projectsData.reduce((sum, p) => sum + toNum(p.completionPercentage), 0) / total
        : 0

    return {
      total,
      planning,
      inProgress,
      review,
      completed,
      cancelled,
      totalBudget,
      totalActualHours,
      averageCompletion
    }
  }



  const handleCreateProject = async (projectData: Record<string, any>) => {
    try {
      await projectsAPI.createProject({
        ...projectData,
        budget: projectData.totalBudget ?? projectData.budget,
      })
      setIsCreateModalOpen(false)
      loadProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Error creating project. Please try again.')
    }
  }

  const handleUpdateProject = async (projectData: Record<string, any>) => {
    if (!editingProject) return
    try {
      await projectsAPI.updateProject(editingProject.id, projectData)
      setIsEditModalOpen(false)
      setEditingProject(null)
      loadProjects()
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error updating project. Please try again.')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectsAPI.deleteProject(projectId)
      loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error deleting project. Please try again.')
    }
  }

  const openEditModal = (project: Project) => {
    setEditingProject(project)
    setIsEditModalOpen(true)
  }

  const openDetailsModal = async (project: Project) => {
    try {
      const full = await projectsAPI.getProject(project.id)
      setViewingProject(full)
      setIsDetailsModalOpen(true)
    } catch {
      setViewingProject(project)
      setIsDetailsModalOpen(true)
    }
  }

  const trackProject = (project: Project) => {
    router.push(`/dashboard/tracking?id=${project.id}`)
  }

  const getStatusBadge = (status: string) => {
    if (!status) return null
    const statusConfig = PROJECT_STATUSES.find(s => s.value === status)
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusConfig?.label || status}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    const n = Number(amount)
    if (!Number.isFinite(n)) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(n)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your development projects
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FolderIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ServerStackIcon className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hosting</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalHostingCost)}</p>
            </div>
          </div>
          <Link href="/dashboard/hosting-expenses" className="mt-2 block text-xs text-blue-600 hover:underline">
            View hosting expenses →
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Completion</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(Number.isFinite(stats.averageCompletion) ? stats.averageCompletion : 0).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {PROJECT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {PROJECT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setTypeFilter('')
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hosting
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <FolderIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first project.</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Create Project
                    </button>
                  </td>
                </tr>
              ) : (
                projects?.filter(project => project && project.id).map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.title || 'Untitled'}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{project.description || 'No description'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.client ? (
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {project.client.firstName || ''} {project.client.lastName || ''}
                            </div>
                            <div className="text-sm text-gray-500">{project.client.email || ''}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No client assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {PROJECT_TYPES.find(t => t.value === project.type)?.label || project.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {(project.budget ?? project.totalBudget) ? formatCurrency(Number(project.budget ?? project.totalBudget) || 0) : 'Not set'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {hostingByProject[project.id] != null ? (
                        <Link
                          href={`/dashboard/hosting-expenses?projectId=${project.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {formatCurrency(hostingByProject[project.id])}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{project.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {project.endDate ? formatDate(project.endDate) : 'Not set'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetailsModal(project)}
                          className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"
                          title="View project details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(project)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                          title="Edit project"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Delete project"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Project Modal - SERTIS-style multi-step with Results Framework */}
      {isCreateModalOpen && (
        <CreateEditProjectForm
          mode="create"
          projectTypes={PROJECT_TYPES}
          clients={clients}
          users={clients}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Edit Project Modal - SERTIS-style multi-step with Results Framework */}
      {isEditModalOpen && editingProject && (
        <CreateEditProjectForm
          mode="edit"
          project={editingProject}
          projectTypes={PROJECT_TYPES}
          clients={clients}
          users={clients}
          onClose={() => { setIsEditModalOpen(false); setEditingProject(null) }}
          onSubmit={handleUpdateProject}
        />
      )}

      {/* Project Details Modal - full info as entered in creation form */}
      {isDetailsModalOpen && viewingProject && (
        <ProjectDetailsModal
          project={viewingProject}
          onClose={() => { setIsDetailsModalOpen(false); setViewingProject(null) }}
          onEdit={() => {
            setIsDetailsModalOpen(false)
            setEditingProject(viewingProject)
            setViewingProject(null)
            setIsEditModalOpen(true)
          }}
          onGoToTracking={() => {
            setIsDetailsModalOpen(false)
            setViewingProject(null)
            trackProject(viewingProject)
          }}
        />
      )}
    </div>
  )
}