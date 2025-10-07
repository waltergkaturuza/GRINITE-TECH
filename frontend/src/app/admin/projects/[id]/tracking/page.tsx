import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import MilestoneCard from '../../components/tracking/MilestoneCard'
import ProgressBar from '../../components/ui/ProgressBar'
import { milestonesAPI, projectsAPI } from '../../lib/api'

interface Project {
  id: string
  title: string
  description?: string
  status: string
  progress?: number
}

interface Milestone {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  orderIndex: number
  dueDate?: string
  estimatedHours?: number
  actualHours?: number
  completedAt?: string
  projectId: string
}

const ProjectTrackingPage: React.FC = () => {
  const params = useParams()
  const projectId = params?.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadProjectData()
    }
  }, [projectId])

  const loadProjectData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Load project details and milestones in parallel
      const [projectData, milestonesData] = await Promise.all([
        projectsAPI.getProject(projectId),
        milestonesAPI.getMilestones(projectId)
      ])
      
      setProject(projectData)
      setMilestones(milestonesData)
    } catch (error) {
      console.error('Failed to load project tracking data:', error)
      setError('Failed to load project data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMilestoneUpdate = (updatedMilestone: Milestone) => {
    setMilestones(prev => 
      prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
    )
    
    // Update project progress based on milestone progress
    const totalProgress = milestones.reduce((sum, m) => 
      m.id === updatedMilestone.id ? sum + updatedMilestone.progress : sum + m.progress
    , 0)
    const newProjectProgress = milestones.length > 0 ? Math.round(totalProgress / milestones.length) : 0
    
    if (project) {
      setProject(prev => prev ? { ...prev, progress: newProjectProgress } : null)
    }
  }

  const getProjectStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'on_hold':
        return 'text-yellow-600 bg-yellow-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project tracking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadProjectData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">📂 Project Not Found</div>
          <p className="text-gray-600">The requested project could not be found.</p>
        </div>
      </div>
    )
  }

  const completedMilestones = milestones.filter(m => m.status === 'COMPLETED').length
  const totalMilestones = milestones.length
  const overallProgress = project.progress || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {project.title}
              </h1>
              {project.description && (
                <p className="mt-2 text-gray-600">
                  {project.description}
                </p>
              )}
              
              {/* Project Status and Progress */}
              <div className="mt-4 flex items-center space-x-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getProjectStatusColor(project.status)}`}>
                  {project.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Overall Progress:</span>
                  <div className="w-48">
                    <ProgressBar value={overallProgress} size="md" />
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {completedMilestones} of {totalMilestones} milestones completed
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button 
                onClick={loadProjectData}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Could open "Add Milestone" modal here
                }}
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {milestones.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Project Milestones ({milestones.length})
              </h2>
              
              {/* Quick Stats */}
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>
                  Not Started: {milestones.filter(m => m.status === 'NOT_STARTED').length}
                </span>
                <span>
                  In Progress: {milestones.filter(m => m.status === 'IN_PROGRESS').length}
                </span>
                <span>
                  Completed: {milestones.filter(m => m.status === 'COMPLETED').length}
                </span>
                <span>
                  Blocked: {milestones.filter(m => m.status === 'BLOCKED').length}
                </span>
              </div>
            </div>

            {/* Milestones List */}
            {milestones
              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
              .map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  onUpdate={handleMilestoneUpdate}
                  defaultExpanded={index === 0} // Expand first milestone by default
                />
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No milestones yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first milestone to track project progress.
            </p>
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Could open "Add Milestone" modal here
              }}
            >
              Create First Milestone
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectTrackingPage