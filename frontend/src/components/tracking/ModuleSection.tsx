import React, { useState, useEffect } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import ProgressBar from '../ui/ProgressBar'
import StatusBadge from '../ui/StatusBadge'
import FeatureCheckbox from './FeatureCheckbox'
import { featuresAPI } from '../../lib/api'

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
  features?: Feature[]
}

interface ModuleSectionProps {
  module: Module
  onUpdate?: (updatedModule: Module) => void
  isExpanded?: boolean
  onToggleExpanded?: (moduleId: string, expanded: boolean) => void
}

const ModuleSection: React.FC<ModuleSectionProps> = ({
  module,
  onUpdate,
  isExpanded: controlledExpanded,
  onToggleExpanded
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const [features, setFeatures] = useState<Feature[]>(module.features || [])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)
  
  // Use controlled expansion if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  const handleToggleExpanded = () => {
    const newExpanded = !isExpanded
    if (onToggleExpanded) {
      onToggleExpanded(module.id, newExpanded)
    } else {
      setInternalExpanded(newExpanded)
    }
  }

  // Load features when module is expanded
  useEffect(() => {
    if (isExpanded && features.length === 0 && !isLoadingFeatures) {
      loadFeatures()
    }
  }, [isExpanded])

  const loadFeatures = async () => {
    setIsLoadingFeatures(true)
    try {
      const fetchedFeatures = await featuresAPI.getFeatures(module.id)
      setFeatures(fetchedFeatures)
    } catch (error) {
      console.error('Failed to load features:', error)
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  const handleFeatureUpdate = (updatedFeature: Feature) => {
    setFeatures(prev => 
      prev.map(f => f.id === updatedFeature.id ? updatedFeature : f)
    )
    
    // Trigger module update if callback provided
    if (onUpdate) {
      // Recalculate progress based on completed features
      const completedCount = features.filter(f => 
        f.id === updatedFeature.id ? updatedFeature.isCompleted : f.isCompleted
      ).length
      const newProgress = Math.round((completedCount / features.length) * 100)
      
      onUpdate({
        ...module,
        progress: newProgress
      })
    }
  }

  const formatHours = (hours?: number) => {
    if (!hours) return null
    return hours === 1 ? '1 hour' : `${hours} hours`
  }

  const completedFeatures = features.filter(f => f.isCompleted).length
  const totalFeatures = features.length

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Module Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Expand/Collapse Icon */}
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              )}
            </div>

            {/* Module Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {module.name}
                </h3>
                <StatusBadge status={module.status} />
              </div>
              
              {module.description && (
                <p className="mt-1 text-sm text-gray-600">
                  {module.description}
                </p>
              )}

              {/* Progress and Stats */}
              <div className="mt-3 flex items-center space-x-6">
                <div className="flex-1 max-w-xs">
                  <ProgressBar value={module.progress} size="md" />
                </div>
                
                <div className="text-sm text-gray-500">
                  {totalFeatures > 0 ? (
                    <span>{completedFeatures} of {totalFeatures} features completed</span>
                  ) : (
                    <span>No features</span>
                  )}
                </div>

                {(module.estimatedHours || module.actualHours) && (
                  <div className="text-sm text-gray-500 space-x-4">
                    {module.estimatedHours && (
                      <span>Est: {formatHours(module.estimatedHours)}</span>
                    )}
                    {module.actualHours && (
                      <span>Actual: {formatHours(module.actualHours)}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List (Collapsible) */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {isLoadingFeatures ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading features...</p>
            </div>
          ) : features.length > 0 ? (
            <div className="p-4 space-y-2">
              {features
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                .map(feature => (
                  <FeatureCheckbox
                    key={feature.id}
                    feature={feature}
                    onUpdate={handleFeatureUpdate}
                  />
                ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No features in this module yet</p>
              <button 
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  // Could open "Add Feature" modal here
                }}
              >
                Add first feature
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ModuleSection