'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'location', label: 'Location & Lead' },
  { id: 'budget', label: 'Budget & Objectives' },
]

const STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'Active' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

interface ProjectFormModalProps {
  mode: 'create' | 'edit'
  project?: any
  projectTypes: { value: string; label: string }[]
  clients: { id: string; firstName: string; lastName: string; email: string }[]
  onClose: () => void
  onSubmit: (data: Record<string, any>) => void
}

export default function ProjectFormModal({
  mode,
  project,
  projectTypes,
  clients,
  onClose,
  onSubmit,
}: ProjectFormModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'website',
    status: 'planning',
    priority: 'medium',
    completionPercentage: 0,
    currency: 'USD',
    budget: '',
    startDate: '',
    endDate: '',
    estimatedHours: '',
    clientId: '',
  })

  useEffect(() => {
    if (mode === 'edit' && project) {
      setForm({
        title: project.title ?? '',
        description: project.description ?? '',
        type: project.type ?? 'website',
        status: project.status ?? 'planning',
        priority: project.priority ?? 'medium',
        completionPercentage: project.completionPercentage ?? 0,
        currency: 'USD',
        budget: project.budget?.toString() ?? '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
        estimatedHours: project.estimatedHours?.toString() ?? '',
        clientId: project.client?.id ?? '',
      })
    } else {
      setForm({
        title: '',
        description: '',
        type: 'website',
        status: 'planning',
        priority: 'medium',
        completionPercentage: 0,
        currency: 'USD',
        budget: '',
        startDate: '',
        endDate: '',
        estimatedHours: '',
        clientId: '',
      })
    }
  }, [mode, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, any> = {
      title: form.title,
      description: form.description,
      type: form.type,
      status: form.status,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      estimatedHours: form.estimatedHours ? parseInt(form.estimatedHours) : undefined,
      clientId: form.clientId || undefined,
    }
    if (mode === 'edit') {
      payload.completionPercentage = Number(form.completionPercentage)
    }
    onSubmit(payload)
  }

  const title = mode === 'create' ? 'Create New Project' : 'Edit Project'
  const subtitle = mode === 'create' ? 'Add a new project to track and manage' : 'Update project information and settings'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Orange header - SERTIS style */}
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-orange-100 text-sm">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white p-1">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Goal / Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Project goal and detailed description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type *</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {projectTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.completionPercentage}
                    onChange={(e) => setForm({ ...form, completionPercentage: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              {mode === 'edit' && project?.id && (
                <p className="text-xs text-gray-500">Project ID: {project.id}</p>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min={0}
                  value={form.estimatedHours}
                  onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Location & Lead</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager / Client</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Budget & Objectives</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-6 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              {mode === 'create' ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
