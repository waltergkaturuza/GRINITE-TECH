import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { projectsAPI, milestonesAPI } from '../../../lib/api'
import ProgressBar from '../../../components/ui/ProgressBar'
import StatusBadge from '../../../components/ui/StatusBadge'

interface Project {
  id: string
  title: string
  description?: string
  status: string
  progress?: number
}

interface ProjectWithStats extends Project {
  milestoneCount: number
  completedMilestones: number
  overallProgress: number
}

const ProjectTrackingOverview: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const projectsData = await projectsAPI.getProjects()
      
      // Load milestone stats for each project
      const projectsWithStats = await Promise.all(
        projectsData.map(async (project: Project) => {
          try {
            const milestones = await milestonesAPI.getMilestones(project.id)
            const completedMilestones = milestones.filter((m: any) => m.status === 'COMPLETED').length
            const overallProgress = milestones.length > 0 
              ? Math.round(milestones.reduce((sum: number, m: any) => sum + m.progress, 0) / milestones.length)
              : 0
            
            return {
              ...project,
              milestoneCount: milestones.length,
              completedMilestones,
              overallProgress
            }
          } catch (error) {
            console.error(`Failed to load milestones for project ${project.id}:`, error)
            return {
              ...project,
              milestoneCount: 0,
              completedMilestones: 0,
              overallProgress: 0
            }
          }
        })
      )
      
      setProjects(projectsWithStats)
    } catch (error) {
      console.error('Failed to load projects:', error)
      setError('Failed to load projects. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project tracking overview...</p>
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
            onClick={loadProjects}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Project Tracking Overview
              </h1>
              <p className="mt-2 text-gray-600">
                Monitor progress across all your projects
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={loadProjects}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
              <Link 
                href="/admin"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    <StatusBadge status={project.status} className="mb-2" />
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{project.overallProgress}%</span>
                  </div>
                  <ProgressBar value={project.overallProgress} size="md" showPercentage={false} />
                </div>

                {/* Stats */}
                <div className="mb-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Milestones:</span>
                    <span>{project.completedMilestones} / {project.milestoneCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completion:</span>
                    <span className={project.overallProgress >= 100 ? 'text-green-600 font-medium' : ''}>
                      {project.overallProgress >= 100 ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/projects/${project.id}/tracking`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Tracking
                  </Link>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to start tracking progress.
            </p>
            <Link 
              href="/admin/projects/new"
              className="inline-flex px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectTrackingOverview