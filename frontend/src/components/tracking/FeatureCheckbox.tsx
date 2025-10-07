import React, { useState } from 'react'
import PriorityBadge from '../ui/PriorityBadge'
import StatusBadge from '../ui/StatusBadge'
import { featuresAPI, modulesAPI, milestonesAPI } from '../../lib/api'

interface Feature {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  isCompleted: boolean
  estimatedHours?: number
  actualHours?: number
  notes?: string
  completedAt?: string
  moduleId: string
}

interface FeatureCheckboxProps {
  feature: Feature
  onUpdate?: (updatedFeature: Feature) => void
  onToggle?: (featureId: string, isCompleted: boolean) => void
  disabled?: boolean
}

const FeatureCheckbox: React.FC<FeatureCheckboxProps> = ({
  feature,
  onUpdate,
  onToggle,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (disabled || isLoading) return

    setIsLoading(true)
    try {
      const newCompletedState = !feature.isCompleted
      
      // Call API to toggle feature
      const updatedFeature = await featuresAPI.toggleFeature(feature.id, newCompletedState)
      
      // Update parent component
      if (onUpdate) {
        onUpdate(updatedFeature)
      }
      if (onToggle) {
        onToggle(feature.id, newCompletedState)
      }
      
      // Trigger progress recalculation
      await modulesAPI.updateProgress(feature.moduleId)
      
    } catch (error) {
      console.error('Failed to toggle feature:', error)
      // Could add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const formatHours = (hours?: number) => {
    if (!hours) return null
    return hours === 1 ? '1 hour' : `${hours} hours`
  }

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border ${
      feature.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    } ${disabled ? 'opacity-50' : 'hover:bg-gray-50'} transition-colors`}>
      
      {/* Checkbox */}
      <div className="flex-shrink-0 pt-1">
        <input
          type="checkbox"
          id={`feature-${feature.id}`}
          checked={feature.isCompleted}
          onChange={handleToggle}
          disabled={disabled || isLoading}
          className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        />
      </div>

      {/* Feature Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Feature Name */}
            <label
              htmlFor={`feature-${feature.id}`}
              className={`block text-sm font-medium cursor-pointer ${
                feature.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
              }`}
            >
              {feature.name}
            </label>
            
            {/* Description */}
            {feature.description && (
              <p className={`mt-1 text-sm ${
                feature.isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            )}

            {/* Time estimates */}
            {(feature.estimatedHours || feature.actualHours) && (
              <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                {feature.estimatedHours && (
                  <span>Est: {formatHours(feature.estimatedHours)}</span>
                )}
                {feature.actualHours && (
                  <span>Actual: {formatHours(feature.actualHours)}</span>
                )}
              </div>
            )}

            {/* Completion date */}
            {feature.isCompleted && feature.completedAt && (
              <p className="mt-1 text-xs text-green-600">
                Completed: {new Date(feature.completedAt).toLocaleDateString()}
              </p>
            )}

            {/* Notes */}
            {feature.notes && (
              <p className="mt-2 text-xs text-gray-500 italic">
                {feature.notes}
              </p>
            )}
          </div>

          {/* Badges */}
          <div className="flex-shrink-0 ml-4 space-y-1">
            <div className="flex space-x-2">
              <PriorityBadge priority={feature.priority} />
              <StatusBadge status={feature.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}

export default FeatureCheckbox