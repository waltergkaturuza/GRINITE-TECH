'use client'

import { XMarkIcon, PencilIcon, DocumentArrowDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface ProjectDetailsModalProps {
  project: any
  onClose: () => void
  onEdit: () => void
  onGoToTracking?: () => void
}

export default function ProjectDetailsModal({ project, onClose, onEdit, onGoToTracking }: ProjectDetailsModalProps) {
  if (!project) return null

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'
  const formatCurrency = (n: number) => n != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) : '—'

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    planning: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-amber-100 text-amber-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  const priorityColors: Record<string, string> = {
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800',
    critical: 'bg-red-100 text-red-800',
  }

  const clientName = project.client
    ? `${project.client.firstName || ''} ${project.client.lastName || ''}`.trim() || project.client.email
    : '—'

  // Prefer metadata.resultsFramework (full cascading), fallback to milestones
  const rf = project.metadata?.resultsFramework
  const objectives = Array.isArray(rf) && rf.length > 0 ? rf : (project.milestones || []).map((m: any) => ({ id: m.id, title: m.name, description: m.description, outcomes: [] }))
  const meta = project.metadata || {}
  const categories = (meta.categories as string[]) || []
  const countries = (meta.countries as string[]) || []
  const provinces = (meta.provinces as string[]) || []
  const methodologies = (meta.methodologies as string[]) || []
  const implementingOrgs = (meta.implementingOrgs as string[]) || []
  const supportingDocs = (meta.supportingDocuments as { url: string; name: string }[]) || []
  const fundingDocs = (meta.fundingDocuments as { url: string; name: string }[]) || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Orange header */}
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Project Details</h2>
            <p className="text-orange-100 text-sm">View comprehensive project information</p>
          </div>
          <button onClick={onClose} className="text-white/90 hover:text-white p-1">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project identity */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
              {project.status?.replace('_', ' ') || '—'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}`}>
              {project.priority || 'Medium'}
            </span>
          </div>

          {(project.projectGoal || project.description) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Project Goal</h3>
              <p className="text-gray-600">{project.projectGoal || project.description}</p>
            </div>
          )}

          {/* Project Code & Type */}
          {(project.projectCode || project.type) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {project.projectCode && (
                <p><span className="font-medium text-gray-700">Project Code:</span> {project.projectCode}</p>
              )}
              {project.type && (
                <p><span className="font-medium text-gray-700">Type:</span> <span className="capitalize">{project.type.replace(/_/g, ' ')}</span></p>
              )}
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c: string, i: number) => (
                  <span key={i} className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {(countries.length > 0 || provinces.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Location</h3>
              <p className="text-sm text-gray-600">
                {countries.length > 0 && <span>Countries: {countries.join(', ')}</span>}
                {provinces.length > 0 && <span className={countries.length ? ' ml-2' : ''}>Provinces: {provinces.join(', ')}</span>}
              </p>
            </div>
          )}

          {/* Evaluation & Methodologies */}
          {(meta.evaluationFrequency || methodologies.length > 0 || implementingOrgs.length > 0) && (
            <div className="space-y-2">
              {meta.evaluationFrequency && (
                <p className="text-sm"><span className="font-medium text-gray-700">Evaluation frequency:</span> {meta.evaluationFrequency}</p>
              )}
              {methodologies.length > 0 && (
                <p className="text-sm"><span className="font-medium text-gray-700">Methodologies:</span> {methodologies.join(', ')}</p>
              )}
              {implementingOrgs.length > 0 && (
                <p className="text-sm"><span className="font-medium text-gray-700">Implementing orgs:</span> {implementingOrgs.join(', ')}</p>
              )}
            </div>
          )}

          {/* Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Progress</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${project.completionPercentage ?? 0}%` }}
                />
              </div>
              <p className="text-lg font-semibold text-gray-900 mt-1">{project.completionPercentage ?? 0}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Budget</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(project.totalBudget ?? project.budget)}</p>
              {project.fundingSource && (
                <p className="text-sm text-gray-500 mt-1">Funding: {project.fundingSource}</p>
              )}
              {project.spentBudget != null && (
                <p className="text-sm text-gray-500">Spent: {formatCurrency(project.spentBudget)}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 uppercase">Timeline</p>
              <p className="text-sm text-gray-900 mt-1">
                {formatDate(project.startDate)} – {formatDate(project.endDate)}
              </p>
            </div>
          </div>

          {/* Project info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Project Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium text-gray-700">Client:</span> {clientName}</p>
              {project.client?.email && (
                <p><span className="font-medium text-gray-700">Email:</span> {project.client.email}</p>
              )}
              <p><span className="font-medium text-gray-700">Currency:</span> USD</p>
            </div>
          </div>

          {/* Documents */}
          {(supportingDocs.length > 0 || fundingDocs.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Documents</h3>
              <div className="space-y-2">
                {supportingDocs.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Supporting documents</p>
                    <ul className="space-y-1">
                      {supportingDocs.map((d: { url: string; name: string }, i: number) => (
                        <li key={i}>
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            {d.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {fundingDocs.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Funding documents</p>
                    <ul className="space-y-1">
                      {fundingDocs.map((d: { url: string; name: string }, i: number) => (
                        <li key={i}>
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            {d.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results Framework - Objective → Outcomes → Outputs with indicators */}
          {objectives.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Results Framework</h3>
              <div className="space-y-4">
                {objectives.map((obj: any, idx: number) => (
                  <div key={obj.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2">
                      <span className="font-medium text-gray-900">Objective {idx + 1}: {obj.title || obj.name}</span>
                      {obj.description && <p className="text-sm text-gray-600 mt-1">{obj.description}</p>}
                    </div>
                    {obj.outcomes?.length > 0 && (
                      <div className="border-t border-gray-100 divide-y divide-gray-100">
                        {obj.outcomes.map((out: any, oi: number) => (
                          <div key={out.id} className="px-4 py-3 bg-green-50/50">
                            <p className="font-medium text-gray-800">Outcome {oi + 1}: {out.title}</p>
                            {out.description && <p className="text-sm text-gray-600 mt-0.5">{out.description}</p>}
                            {out.indicators?.length > 0 && (
                              <div className="mt-2 ml-2 text-sm">
                                <span className="font-medium text-gray-700">Indicators: </span>
                                {out.indicators.map((i: any) => i.description || '—').join('; ')}
                              </div>
                            )}
                            {out.outputs?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {out.outputs.map((op: any, pi: number) => (
                                  <div key={op.id} className="ml-2 p-2 bg-amber-50 rounded border border-amber-100">
                                    <p className="font-medium text-gray-800">Output {pi + 1}: {op.title}</p>
                                    {op.description && <p className="text-xs text-gray-600">{op.description}</p>}
                                    {op.indicators?.length > 0 && (
                                      <p className="text-xs text-gray-600 mt-1">Indicators: {op.indicators.map((i: any) => i.description || '—').join('; ')}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span><span className="text-blue-600 font-medium">{objectives.length}</span> Objectives</span>
            <span><span className="text-green-600 font-medium">{objectives.reduce((s: number, o: any) => s + (o.outcomes?.length || 0), 0)}</span> Outcomes</span>
            <span><span className="text-orange-600 font-medium">{objectives.reduce((s: number, o: any) => s + (o.outcomes || []).reduce((a: number, u: any) => a + (u.outputs?.length || 0), 0), 0)}</span> Outputs</span>
            <span><span className="font-medium text-gray-900">{objectives.reduce((s: number, o: any) => {
              const outs = o.outcomes || []
              const outInd = outs.reduce((a: number, u: any) => a + (u.indicators?.length || 0), 0)
              const opInd = outs.reduce((a: number, u: any) => a + (u.outputs || []).reduce((b: number, p: any) => b + (p.indicators?.length || 0), 0), 0)
              return s + outInd + opInd
            }, 0)}</span> Total Indicators</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500">Project ID: {project.id}</p>
          <div className="flex flex-wrap gap-2">
            {onGoToTracking && (
              <button
                onClick={onGoToTracking}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium flex items-center gap-2"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                Go to Tracking
              </button>
            )}
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium flex items-center gap-2">
              <DocumentArrowDownIcon className="w-4 h-4" />
              Export PDF
            </button>
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
              Close
            </button>
            <button onClick={onEdit} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium flex items-center gap-2">
              <PencilIcon className="w-4 h-4" />
              Edit Project
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
