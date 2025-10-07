import React from 'react'

interface ProgressBarProps {
  value: number // 0-100
  className?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className = '',
  showPercentage = true,
  size = 'md',
  variant = 'default'
}) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value))
  
  // Determine color based on value and variant
  const getColor = () => {
    if (variant !== 'default') {
      const colors = {
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        danger: 'bg-red-500'
      }
      return colors[variant]
    }
    
    // Auto color based on progress
    if (clampedValue >= 80) return 'bg-green-500'
    if (clampedValue >= 50) return 'bg-blue-500'
    if (clampedValue >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full transition-all duration-300 ease-out ${getColor()}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-sm text-gray-600 ml-2 inline-block min-w-[3rem]">
          {clampedValue}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar