'use client'

import { useState, useEffect } from 'react'
import { projectsAPI } from '@/lib/api'
import {
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

type IndicatorType = 'outcome' | 'output'
type IndicatorStatus = 'on_track' | 'behind' | 'ahead' | 'completed'

interface FlatIndicator {
  id: string
  description: string
  type: IndicatorType
  objectiveTitle: string
  outcomeTitle: string
  outputTitle?: string
  targetYear1: string
  targetYear2: string
  targetYear3: string
  targetUnit: string
  currentValue: number
  status: IndicatorStatus
  lastUpdatedAt?: string
  lastUpdatedBy?: string
  notes?: string
  progressPercent: number
  totalTarget: number
}

interface Project {
  id: string
  title: string
  metadata?: { resultsFramework?: any[]; indicatorProgress?: Record<string, any> }
}

function flattenIndicators(project: Project): FlatIndicator[] {
  const rf = project.metadata?.resultsFramework || []
  const progress = project.metadata?.indicatorProgress || {}
  const flat: FlatIndicator[] = []
  let idx = 0

  for (const obj of rf) {
    for (const out of obj.outcomes || []) {
      for (const ind of out.indicators || []) {
        idx++
        const p = progress[ind.id] || {}
        const target1 = parseFloat(ind.targetYear1) || 0
        const target2 = parseFloat(ind.targetYear2) || 0
        const target3 = parseFloat(ind.targetYear3) || 0
        const totalTarget = target1 + target2 + target3 || 1
        const current = p.currentValue ?? 0
        const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((current / totalTarget) * 100)) : 0

        flat.push({
          id: ind.id,
          description: ind.description || `Indicator ${idx}`,
          type: 'outcome',
          objectiveTitle: obj.title || '',
          outcomeTitle: out.title || '',
          targetYear1: ind.targetYear1,
          targetYear2: ind.targetYear2,
          targetYear3: ind.targetYear3,
          targetUnit: ind.targetUnit || '',
          currentValue: current,
          status: (p.status as IndicatorStatus) || 'on_track',
          lastUpdatedAt: p.lastUpdatedAt,
          lastUpdatedBy: p.lastUpdatedBy,
          notes: p.notes,
          progressPercent,
          totalTarget,
        })
      }
      for (const op of out.outputs || []) {
        for (const ind of op.indicators || []) {
          idx++
          const p = progress[ind.id] || {}
          const target1 = parseFloat(ind.targetYear1) || 0
          const target2 = parseFloat(ind.targetYear2) || 0
          const target3 = parseFloat(ind.targetYear3) || 0
          const totalTarget = target1 + target2 + target3 || 1
          const current = p.currentValue ?? 0
          const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((current / totalTarget) * 100)) : 0

          flat.push({
            id: ind.id,
            description: ind.description || `Indicator ${idx}`,
            type: 'output',
            objectiveTitle: obj.title || '',
            outcomeTitle: out.title || '',
            outputTitle: op.title,
            targetYear1: ind.targetYear1,
            targetYear2: ind.targetYear2,
            targetYear3: ind.targetYear3,
            targetUnit: ind.targetUnit || '',
            currentValue: current,
            status: (p.status as IndicatorStatus) || 'on_track',
            lastUpdatedAt: p.lastUpdatedAt,
            lastUpdatedBy: p.lastUpdatedBy,
            notes: p.notes,
            progressPercent,
            totalTarget,
          })
        }
      }
    }
  }
  return flat
}

export default function ProjectIndicatorsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(new Set())
  const [bulkIncrement, setBulkIncrement] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')
  const [incrementValues, setIncrementValues] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await projectsAPI.getProjects({ limit: 200 })
      const list = res.projects || res.data || []
      setProjects(list)
      if (!selectedProjectId && list.length > 0) setSelectedProjectId(list[0].id)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const indicators = selectedProject ? flattenIndicators(selectedProject) : []

  const onTrack = indicators.filter(i => i.status === 'on_track').length
  const behind = indicators.filter(i => i.status === 'behind').length
  const completed = indicators.filter(i => i.status === 'completed').length
  const ahead = indicators.filter(i => i.status === 'ahead').length

  const barData = {
    labels: indicators.map((i, idx) => `Indicator ${idx + 1}`),
    datasets: [{
      label: 'Current progress',
      data: indicators.map(i => i.currentValue),
      backgroundColor: 'rgba(194, 65, 12, 0.7)',
      borderColor: 'rgb(194, 65, 12)',
      borderWidth: 1,
    }],
  }

  const pieData = {
    labels: ['On Track', 'Ahead', 'Behind', 'Completed'],
    datasets: [{
      data: [onTrack, ahead, behind, completed],
      backgroundColor: ['#2563eb', '#f59e0b', '#ef4444', '#22c55e'],
      borderWidth: 0,
    }],
  }

  const handleIncrement = async (indicatorId: string, value?: number) => {
    const v = value ?? parseFloat(incrementValues[indicatorId] || '1')
    if (isNaN(v) || v <= 0) return
    if (!selectedProjectId) return
    setUpdatingId(indicatorId)
    try {
      await projectsAPI.updateIndicatorProgress(selectedProjectId, {
        indicatorId,
        incrementBy: v,
      })
      await loadProjects()
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = async (indicatorId: string, status: IndicatorStatus) => {
    if (!selectedProjectId) return
    setUpdatingId(indicatorId)
    try {
      await projectsAPI.updateIndicatorProgress(selectedProjectId, { indicatorId, status })
      await loadProjects()
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleBulkSelect = (id: string) => {
    setSelectedForBulk(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkUpdate = async () => {
    if (!selectedProjectId || selectedForBulk.size === 0) return
    const inc = parseFloat(bulkIncrement)
    if (isNaN(inc) || inc <= 0) return
    setUpdatingId('bulk')
    try {
      await projectsAPI.bulkUpdateIndicators(selectedProjectId, {
        updates: Array.from(selectedForBulk).map(indicatorId => ({
          indicatorId,
          incrementBy: inc,
          notes: bulkNotes || undefined,
        })),
        notes: bulkNotes,
      })
      await loadProjects()
      setBulkModalOpen(false)
      setSelectedForBulk(new Set())
      setBulkIncrement('')
      setBulkNotes('')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusLabel: Record<IndicatorStatus, string> = {
    on_track: 'On Track',
    ahead: 'Ahead',
    behind: 'Behind',
    completed: 'Completed',
  }

  const statusClass: Record<IndicatorStatus, string> = {
    on_track: 'bg-blue-100 text-blue-800',
    ahead: 'bg-amber-100 text-amber-800',
    behind: 'bg-red-100 text-red-800',
    completed: 'bg-green-100 text-green-800',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-orange-500 px-6 py-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Project Indicators Dashboard
          </h1>
          <p className="text-orange-100 text-sm mt-1">
            Track and update project output indicator progress with complete audit trail.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="px-4 py-2 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 flex items-center gap-2"
          >
            <PencilSquareIcon className="w-5 h-5" />
            Bulk Update
          </button>
          <button
            onClick={loadProjects}
            className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Project</label>
        <select
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        {selectedProject && (
          <p className="text-sm text-gray-500 mt-2">Showing: {selectedProject.title}</p>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-orange-500 rounded-lg p-4 text-white flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8" />
          <div>
            <p className="text-orange-100 text-sm">Total Indicators</p>
            <p className="text-2xl font-bold">{indicators.length}</p>
          </div>
        </div>
        <div className="bg-green-600 rounded-lg p-4 text-white flex items-center gap-3">
          <CheckCircleIcon className="w-8 h-8" />
          <div>
            <p className="text-green-100 text-sm">On Track</p>
            <p className="text-2xl font-bold">{onTrack}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="w-8 h-8 text-amber-600" />
          <div>
            <p className="text-gray-600 text-sm">Behind</p>
            <p className="text-2xl font-bold text-gray-900">{behind}</p>
          </div>
        </div>
        <div className="bg-green-600 rounded-lg p-4 text-white flex items-center gap-3">
          <CheckCircleIcon className="w-8 h-8" />
          <div>
            <p className="text-green-100 text-sm">Completed</p>
            <p className="text-2xl font-bold">{completed}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-orange-500" />
            Indicator Progress
          </h3>
          <div className="h-64">
            {indicators.length > 0 ? (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No indicators</div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Indicator Legend (by objective – outcome)</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
            Status Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {indicators.length > 0 ? (
              <Doughnut
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                }}
              />
            ) : (
              <div className="text-gray-400">No indicators</div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> On Track: {onTrack}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Ahead: {ahead}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Behind: {behind}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed: {completed}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-orange-500 px-6 py-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <PencilSquareIcon className="w-5 h-5" />
            Project Indicators Progress Update
          </h3>
          <p className="text-orange-100 text-sm mt-0.5">
            Enter incremental progress for each indicator – values will be added to current totals.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Indicator</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Current progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Progress %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Last updated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {indicators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    No indicators. Add a Results Framework in the project creation form.
                  </td>
                </tr>
              ) : (
                indicators.map((ind, idx) => (
                  <tr key={ind.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{ind.description}</p>
                        <p className="text-xs text-gray-500">
                          Objective: {ind.objectiveTitle} – Outcome: {ind.outcomeTitle}
                          {ind.outputTitle && ` – Output: ${ind.outputTitle}`}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${ind.type === 'outcome' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {ind.type.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <p>Year 1–3: {ind.targetYear1} {ind.targetUnit} / {ind.targetYear2} {ind.targetUnit} / {ind.targetYear3} {ind.targetUnit}</p>
                      <p>Total: {ind.totalTarget} {ind.targetUnit}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{ind.currentValue} {ind.targetUnit}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Add"
                          value={incrementValues[ind.id] ?? ''}
                          onChange={e => setIncrementValues(prev => ({ ...prev, [ind.id]: e.target.value }))}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => handleIncrement(ind.id)}
                          disabled={updatingId === ind.id}
                          className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50"
                          title="Add value to progress"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px]">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${ind.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{ind.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={ind.status}
                        onChange={e => handleStatusChange(ind.id, e.target.value as IndicatorStatus)}
                        disabled={updatingId === ind.id}
                        className={`text-sm font-medium px-2 py-1 rounded ${statusClass[ind.status]} border-0`}
                      >
                        {(Object.keys(statusLabel) as IndicatorStatus[]).map(s => (
                          <option key={s} value={s}>{statusLabel[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ind.lastUpdatedBy && ind.lastUpdatedAt ? (
                        <>
                          <p>{ind.lastUpdatedBy}</p>
                          <p className="text-xs">{new Date(ind.lastUpdatedAt).toLocaleDateString()}</p>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{ind.notes || 'No notes'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bulk Update Indicators</h2>
              <button onClick={() => setBulkModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="px-6 py-2 text-sm text-gray-600">
              Select multiple indicators to update their progress at once.
            </p>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Increment by (value to add)</label>
                <input
                  type="number"
                  value={bulkIncrement}
                  onChange={e => setBulkIncrement(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes for this bulk update</label>
                <textarea
                  value={bulkNotes}
                  onChange={e => setBulkNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Optional"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Select indicators ({selectedForBulk.size} selected)</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {indicators.map(ind => (
                    <label key={ind.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedForBulk.has(ind.id)}
                        onChange={() => toggleBulkSelect(ind.id)}
                        className="mt-1"
                      />
                      <span className="text-sm">{ind.description}</span>
                      <span className="text-xs text-gray-500">(current: {ind.currentValue})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={selectedForBulk.size === 0 || !bulkIncrement || updatingId === 'bulk'}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                Update {selectedForBulk.size} Indicators
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
