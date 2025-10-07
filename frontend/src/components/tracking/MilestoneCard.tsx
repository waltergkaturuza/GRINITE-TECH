import React, { useState, useEffect } from 'react'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import ProgressBar from '../ui/ProgressBar'
import StatusBadge from '../ui/StatusBadge'
import ModuleSection from './ModuleSection'
import { modulesAPI } from '../../lib/api'

interface Module {
  id: string
  name: string
  description?: string
  status: string
  progress: number
  orderIndex: number
  estimatedHours?: number
  actualHours?: number
  milestoneId: string
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
  modules?: Module[]
}

interface MilestoneCardProps {
  milestone: Milestone
  onUpdate?: (updatedMilestone: Milestone) => void
  defaultExpanded?: boolean
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onUpdate,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [modules, setModules] = useState<Module[]>(milestone.modules || [])
  const [isLoadingModules, setIsLoadingModules] = useState(false)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Load modules when milestone is expanded
  useEffect(() => {
    if (isExpanded && modules.length === 0 && !isLoadingModules) {
      loadModules()
    }
  }, [isExpanded])

  const loadModules = async () => {
    setIsLoadingModules(true)
    try {
      const fetchedModules = await modulesAPI.getModules(milestone.id)
      setModules(fetchedModules)
    } catch (error) {
      console.error('Failed to load modules:', error)
    } finally {
      setIsLoadingModules(false)
    }
  }

  const handleModuleUpdate = (updatedModule: Module) => {
    setModules(prev => 
      prev.map(m => m.id === updatedModule.id ? updatedModule : m)
    )
    
    // Trigger milestone update if callback provided
    if (onUpdate) {
      // Recalculate milestone progress based on module progress
      const totalProgress = modules.reduce((sum, m) => 
        m.id === updatedModule.id ? sum + updatedModule.progress : sum + m.progress
      , 0)
      const newProgress = modules.length > 0 ? Math.round(totalProgress / modules.length) : 0
      
      onUpdate({
        ...milestone,
        progress: newProgress
      })
    }
  }

  const handleToggleModuleExpanded = (moduleId: string, expanded: boolean) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev)
      if (expanded) {
        newSet.add(moduleId)
      } else {
        newSet.delete(moduleId)
      }
      return newSet
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatHours = (hours?: number) => {
    if (!hours) return null
    return hours === 1 ? '1 hour' : `${hours} hours`
  }

  const getDueDateStatus = () => {
    if (!milestone.dueDate) return null
    
    const dueDate = new Date(milestone.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (milestone.status === 'COMPLETED') return 'completed'
    if (diffDays < 0) return 'overdue'
    if (diffDays <= 7) return 'due-soon'
    return 'on-track'
  }

  const dueDateStatus = getDueDateStatus()
  const dueDateColors = {
    'overdue': 'text-red-600 bg-red-50',
    'due-soon': 'text-orange-600 bg-orange-50',
    'on-track': 'text-green-600 bg-green-50',
    'completed': 'text-green-600 bg-green-50'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Milestone Header */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Status */}
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                {milestone.name}
              </h2>
              <StatusBadge status={milestone.status} />
            </div>

            {/* Description */}
            {milestone.description && (
              <p className="text-gray-700 mb-4">
                {milestone.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-600">{modules.length} modules</span>
              </div>
              <ProgressBar value={milestone.progress} size="lg" />
            </div>

            {/* Metadata Row */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              {/* Due Date */}
              {milestone.dueDate && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded ${
                  dueDateStatus ? dueDateColors[dueDateStatus] : ''
                }`}>
                  <CalendarIcon className="h-4 w-4" />
                  <span>Due: {formatDate(milestone.dueDate)}</span>
                </div>
              )}

              {/* Time Estimates */}
              {(milestone.estimatedHours || milestone.actualHours) && (
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>
                    {milestone.estimatedHours && `Est: ${formatHours(milestone.estimatedHours)}`}
                    {milestone.estimatedHours && milestone.actualHours && ' | '}
                    {milestone.actualHours && `Actual: ${formatHours(milestone.actualHours)}`}
                  </span>
                </div>
              )}

              {/* Completion Date */}
              {milestone.completedAt && (
                <div className="text-green-600">
                  Completed: {formatDate(milestone.completedAt)}
                </div>
              )}
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Modules List (Collapsible) */}
      {isExpanded && (
        <div className="p-6">
          {isLoadingModules ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading modules...</p>
            </div>
          ) : modules.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Modules ({modules.length})
              </h3>
              {modules
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                .map(module => (
                  <ModuleSection
                    key={module.id}
                    module={module}
                    onUpdate={handleModuleUpdate}
                    isExpanded={expandedModules.has(module.id)}
                    onToggleExpanded={handleToggleModuleExpanded}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No modules in this milestone yet</p>
              <button 
                className="mt-3 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // Could open "Add Module" modal here
                }}
              >
                Add first module
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MilestoneCard