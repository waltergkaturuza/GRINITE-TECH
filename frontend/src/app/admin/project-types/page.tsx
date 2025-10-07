'use client'

import React, { useState, useEffect } from 'react'
import { projectTypesAPI } from '@/lib/api'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface ProjectType {
  id: string
  value: string
  label: string
  category: string
  description?: string
  icon?: string
  isActive: boolean
  isCustom: boolean
  orderIndex: number
  createdAt: string
  updatedAt: string
}

interface ProjectTypeForm {
  value: string
  label: string
  category: string
  description: string
  icon: string
  orderIndex: number
}

export default function ProjectTypesManagement() {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingType, setEditingType] = useState<ProjectType | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const [projectTypeForm, setProjectTypeForm] = useState<ProjectTypeForm>({
    value: '',
    label: '',
    category: '',
    description: '',
    icon: '',
    orderIndex: 0
  })

  useEffect(() => {
    loadData()
  }, [showInactive, selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)
      const [typesData, categoriesData] = await Promise.all([
        projectTypesAPI.getProjectTypes({ includeInactive: showInactive, category: selectedCategory }),
        projectTypesAPI.getCategories()
      ])
      setProjectTypes(typesData)
      setCategories(categoriesData)
      
      // Auto-expand first few categories
      if (categoriesData.length > 0) {
        setExpandedCategories(new Set(categoriesData.slice(0, 3)))
      }
    } catch (err: any) {
      setError('Failed to load project types: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingType) {
        await projectTypesAPI.updateProjectType(editingType.id, projectTypeForm)
      } else {
        await projectTypesAPI.createProjectType(projectTypeForm)
      }
      await loadData()
      resetForm()
    } catch (err: any) {
      setError('Failed to save project type: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (projectType: ProjectType) => {
    setEditingType(projectType)
    setProjectTypeForm({
      value: projectType.value,
      label: projectType.label,
      category: projectType.category,
      description: projectType.description || '',
      icon: projectType.icon || '',
      orderIndex: projectType.orderIndex
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project type?')) {
      try {
        await projectTypesAPI.deleteProjectType(id)
        await loadData()
      } catch (err: any) {
        setError('Failed to delete project type: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await projectTypesAPI.deactivateProjectType(id)
      } else {
        await projectTypesAPI.reactivateProjectType(id)
      }
      await loadData()
    } catch (err: any) {
      setError('Failed to toggle project type status: ' + (err.response?.data?.message || err.message))
    }
  }

  const resetForm = () => {
    setProjectTypeForm({
      value: '',
      label: '',
      category: '',
      description: '',
      icon: '',
      orderIndex: 0
    })
    setEditingType(null)
    setIsFormOpen(false)
  }

  const seedDefaultTypes = async () => {
    if (confirm('This will seed the database with default project types. Continue?')) {
      try {
        await projectTypesAPI.seedDefaultTypes()
        await loadData()
      } catch (err: any) {
        setError('Failed to seed default types: ' + (err.response?.data?.message || err.message))
      }
    }
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const filteredTypes = projectTypes.filter(type => {
    const matchesSearch = type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const groupedTypes = filteredTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = []
    }
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, ProjectType[]>)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Types Management</h1>
              <p className="text-gray-600 mt-1">Manage project types and categories for your organization</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={seedDefaultTypes}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Seed Defaults
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add Project Type
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search project types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show Inactive</span>
            </label>
          </div>
        </div>

        {/* Project Types by Category */}
        <div className="space-y-4">
          {Object.entries(groupedTypes).map(([category, types]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                  <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                    {types.length}
                  </span>
                </div>
                {expandedCategories.has(category) ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {expandedCategories.has(category) && (
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {types.map(type => (
                      <div
                        key={type.id}
                        className={`p-4 border rounded-lg ${
                          type.isActive ? 'border-gray-200 bg-white' : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{type.icon}</span>
                            <div>
                              <h3 className={`font-medium ${type.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                {type.label}
                              </h3>
                              <code className="text-xs text-gray-500">{type.value}</code>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {type.isCustom && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                Custom
                              </span>
                            )}
                            {!type.isActive && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {type.description && (
                          <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Order: {type.orderIndex}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleActive(type.id, type.isActive)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title={type.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {type.isActive ? (
                                <EyeIcon className="h-4 w-4" />
                              ) : (
                                <EyeSlashIcon className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEdit(type)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {type.isCustom && (
                              <button
                                onClick={() => handleDelete(type.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingType ? 'Edit Project Type' : 'Add Project Type'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTypeForm.value}
                    onChange={(e) => setProjectTypeForm({ ...projectTypeForm, value: e.target.value })}
                    placeholder="e.g., custom_project"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectTypeForm.label}
                    onChange={(e) => setProjectTypeForm({ ...projectTypeForm, label: e.target.value })}
                    placeholder="e.g., 🎨 Custom Project"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={projectTypeForm.category}
                    onChange={(e) => setProjectTypeForm({ ...projectTypeForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="Custom">Custom Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={projectTypeForm.description}
                    onChange={(e) => setProjectTypeForm({ ...projectTypeForm, description: e.target.value })}
                    placeholder="Brief description of this project type"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={projectTypeForm.icon}
                    onChange={(e) => setProjectTypeForm({ ...projectTypeForm, icon: e.target.value })}
                    placeholder="e.g., 🎨"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    value={projectTypeForm.orderIndex}
                    onChange={(e) => setProjectTypeForm({ ...projectTypeForm, orderIndex: parseInt(e.target.value) })}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingType ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}