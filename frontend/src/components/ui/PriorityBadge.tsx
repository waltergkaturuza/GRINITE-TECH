import React from 'react'

interface PriorityBadgeProps {
  priority: string
  className?: string
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getPriorityColor = (priority: string) => {
    const priorityLower = priority.toLowerCase()
    switch (priorityLower) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'high':
        return 'bg-orange-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-black'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${getPriorityColor(priority)} ${className}`}
    >
      {formatPriority(priority)}
    </span>
  )
}

export default PriorityBadge