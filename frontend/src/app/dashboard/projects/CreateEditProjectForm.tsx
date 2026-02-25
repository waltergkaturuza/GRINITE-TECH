'use client'

import { useState, useEffect } from 'react'
import {
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import BlobFileUpload from '@/components/BlobFileUpload'
import {
  PROJECT_CATEGORIES,
  EVALUATION_FREQUENCY,
  METHODOLOGIES,
  AFRICAN_COUNTRIES,
  ZIMBABWE_PROVINCES,
  INDICATOR_FREQUENCIES,
  DISAGGREGATION_OPTIONS,
  type Objective,
  type Outcome,
  type Output,
  type OutcomeIndicator,
  type OutputIndicator,
} from '@/constants/projectForm'

const emptyIndicator = (): OutcomeIndicator => ({
  id: crypto.randomUUID(),
  description: '',
  baselineValue: '',
  baselineUnit: '',
  methodForMonitoring: '',
  targetYear1: '',
  targetYear2: '',
  targetYear3: '',
  targetUnit: '',
  frequency: '',
  dataSource: '',
  disaggregation: [],
  comments: '',
})

const emptyOutputIndicator = (): OutputIndicator => ({ ...emptyIndicator(), id: crypto.randomUUID() })

const emptyOutput = (): Output => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  indicators: [],
})

const emptyOutcome = (): Outcome => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  indicators: [],
  outputs: [],
})

const emptyObjective = (): Objective => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
  outcomes: [],
})

const STEPS = [
  { id: 1, label: 'Project Information', icon: DocumentTextIcon },
  { id: 2, label: 'Financial Details', icon: CurrencyDollarIcon },
  { id: 3, label: 'Results Framework', icon: ChartBarIcon },
]

interface CreateEditProjectFormProps {
  mode: 'create' | 'edit'
  project?: any
  projectTypes: { value: string; label: string }[]
  clients: { id: string; firstName: string; lastName: string; email: string; role?: string }[]
  users?: { id: string; firstName: string; lastName: string; email: string }[]
  onClose: () => void
  onSubmit: (data: Record<string, any>) => void
}

export default function CreateEditProjectForm({
  mode,
  project,
  projectTypes,
  clients,
  users = [],
  onClose,
  onSubmit,
}: CreateEditProjectFormProps) {
  const [step, setStep] = useState(1)
  const [projectDurationYears, setProjectDurationYears] = useState(3)
  const [expandedObj, setExpandedObj] = useState<Set<string>>(new Set())
  const [expandedOut, setExpandedOut] = useState<Set<string>>(new Set())
  const [expandedOutput, setExpandedOutput] = useState<Set<string>>(new Set())

  const [form, setForm] = useState({
    projectCode: '',
    title: '',
    clientId: '',
    projectGoal: '',
    description: '',
    type: 'website',
    status: 'planning',
    categories: [] as string[],
    startDate: '',
    endDate: '',
    countries: [] as string[],
    provinces: [] as string[],
    evaluationFrequency: '',
    methodologies: [] as string[],
    implementingOrgs: [] as string[],
    totalBudget: '',
    fundingSource: '',
    teamMemberIds: [] as string[],
  })

  const [supportingDocuments, setSupportingDocuments] = useState<{ url: string; pathname: string; name: string }[]>([])
  const [fundingDocuments, setFundingDocuments] = useState<{ url: string; pathname: string; name: string }[]>([])
  const [objectives, setObjectives] = useState<Objective[]>([])

  const allUsers = users.length > 0 ? users : clients

  useEffect(() => {
    if (mode === 'edit' && project) {
      setForm({
        projectCode: project.projectCode ?? '',
        title: project.title ?? '',
        clientId: project.client?.id ?? '',
        projectGoal: project.projectGoal ?? project.description ?? '',
        description: project.description ?? '',
        type: project.type ?? 'website',
        status: project.status ?? 'planning',
        categories: (project.metadata?.categories as string[]) ?? [],
        startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
        countries: (project.metadata?.countries as string[]) ?? [],
        provinces: (project.metadata?.provinces as string[]) ?? [],
        evaluationFrequency: project.metadata?.evaluationFrequency ?? '',
        methodologies: (project.metadata?.methodologies as string[]) ?? [],
        implementingOrgs: (project.metadata?.implementingOrgs as string[]) ?? [],
        totalBudget: (project.totalBudget ?? project.budget)?.toString() ?? '',
        fundingSource: project.fundingSource ?? '',
        teamMemberIds: (project.metadata?.teamMemberIds as string[]) ?? [],
      })
      setSupportingDocuments((project.metadata?.supportingDocuments as { url: string; pathname: string; name: string }[]) || [])
      setFundingDocuments((project.metadata?.fundingDocuments as { url: string; pathname: string; name: string }[]) || [])
      const rf = project.metadata?.resultsFramework as Objective[]
      if (rf?.length) setObjectives(rf)
      if (project.metadata?.projectDurationYears) setProjectDurationYears(project.metadata.projectDurationYears)
    }
  }, [mode, project])

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat],
    }))
  }

  const toggleCountry = (c: string) => {
    setForm(f => ({
      ...f,
      countries: f.countries.includes(c) ? f.countries.filter(x => x !== c) : [...f.countries, c],
    }))
  }

  const toggleProvince = (p: string) => {
    setForm(f => ({
      ...f,
      provinces: f.provinces.includes(p) ? f.provinces.filter(x => x !== p) : [...f.provinces, p],
    }))
  }

  const toggleMethodology = (m: string) => {
    setForm(f => ({
      ...f,
      methodologies: f.methodologies.includes(m) ? f.methodologies.filter(x => x !== m) : [...f.methodologies, m],
    }))
  }

  const toggleTeamMember = (id: string) => {
    setForm(f => ({
      ...f,
      teamMemberIds: f.teamMemberIds.includes(id) ? f.teamMemberIds.filter(x => x !== id) : [...f.teamMemberIds, id],
    }))
  }

  const addObjective = () => setObjectives(o => [...o, emptyObjective()])
  const removeObjective = (id: string) => setObjectives(o => o.filter(x => x.id !== id))
  const updateObjective = (id: string, upd: Partial<Objective>) => {
    setObjectives(o => o.map(x => (x.id === id ? { ...x, ...upd } : x)))
  }

  const addOutcome = (objId: string) => {
    setObjectives(o =>
      o.map(obj => (obj.id === objId ? { ...obj, outcomes: [...obj.outcomes, emptyOutcome()] } : obj))
    )
  }
  const removeOutcome = (objId: string, outId: string) => {
    setObjectives(o =>
      o.map(obj => (obj.id === objId ? { ...obj, outcomes: obj.outcomes.filter(x => x.id !== outId) } : obj))
    )
  }
  const updateOutcome = (objId: string, outId: string, upd: Partial<Outcome>) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId ? { ...obj, outcomes: obj.outcomes.map(u => (u.id === outId ? { ...u, ...upd } : u)) } : obj
      )
    )
  }

  const addOutcomeIndicator = (objId: string, outId: string) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId ? { ...u, indicators: [...u.indicators, emptyIndicator()] } : u
              ),
            }
          : obj
      )
    )
  }
  const removeOutcomeIndicator = (objId: string, outId: string, indId: string) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId ? { ...u, indicators: u.indicators.filter(i => i.id !== indId) } : u
              ),
            }
          : obj
      )
    )
  }
  const updateOutcomeIndicator = (objId: string, outId: string, indId: string, upd: Partial<OutcomeIndicator>) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId
                  ? { ...u, indicators: u.indicators.map(i => (i.id === indId ? { ...i, ...upd } : i)) }
                  : u
              ),
            }
          : obj
      )
    )
  }

  const addOutput = (objId: string, outId: string) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? { ...obj, outcomes: obj.outcomes.map(u => (u.id === outId ? { ...u, outputs: [...u.outputs, emptyOutput()] } : u)) }
          : obj
      )
    )
  }
  const removeOutput = (objId: string, outId: string, opId: string) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? { ...obj, outcomes: obj.outcomes.map(u => (u.id === outId ? { ...u, outputs: u.outputs.filter(x => x.id !== opId) } : u)) }
          : obj
      )
    )
  }
  const updateOutput = (objId: string, outId: string, opId: string, upd: Partial<Output>) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId ? { ...u, outputs: u.outputs.map(p => (p.id === opId ? { ...p, ...upd } : p)) } : u
              ),
            }
          : obj
      )
    )
  }

  const addOutputIndicator = (objId: string, outId: string, opId: string) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId
                  ? { ...u, outputs: u.outputs.map(p => (p.id === opId ? { ...p, indicators: [...p.indicators, emptyOutputIndicator()] } : p)) }
                  : u
              ),
            }
          : obj
      )
    )
  }
  const removeOutputIndicator = (objId: string, outId: string, opId: string, indId: string) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId
                  ? { ...u, outputs: u.outputs.map(p => (p.id === opId ? { ...p, indicators: p.indicators.filter(i => i.id !== indId) } : p)) }
                  : u
              ),
            }
          : obj
      )
    )
  }
  const updateOutputIndicator = (objId: string, outId: string, opId: string, indId: string, upd: Partial<OutputIndicator>) => {
    setObjectives(o =>
      o.map(obj =>
        obj.id === objId
          ? {
              ...obj,
              outcomes: obj.outcomes.map(u =>
                u.id === outId
                  ? {
                      ...u,
                      outputs: u.outputs.map(p =>
                        p.id === opId ? { ...p, indicators: p.indicators.map(i => (i.id === indId ? { ...i, ...upd } : i)) } : p
                      ),
                    }
                  : u
              ),
            }
          : obj
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const metadata: Record<string, any> = {
      categories: form.categories,
      countries: form.countries,
      provinces: form.provinces,
      evaluationFrequency: form.evaluationFrequency,
      methodologies: form.methodologies,
      implementingOrgs: form.implementingOrgs,
      teamMemberIds: form.teamMemberIds,
      resultsFramework: objectives,
      projectDurationYears: projectDurationYears,
      supportingDocuments,
      fundingDocuments,
    }
    const payload: Record<string, any> = {
      title: form.title,
      projectCode: form.projectCode || undefined,
      description: form.description,
      projectGoal: form.projectGoal,
      type: form.type,
      status: form.status,
      clientId: form.clientId || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      totalBudget: form.totalBudget ? parseFloat(form.totalBudget) : undefined,
      budget: form.totalBudget ? parseFloat(form.totalBudget) : undefined,
      fundingSource: form.fundingSource || undefined,
      metadata,
    }
    if (mode === 'edit' && project) payload.completionPercentage = project.completionPercentage
    onSubmit(payload)
  }

  const objCount = objectives.length
  const outCount = objectives.reduce((s, o) => s + o.outcomes.length, 0)
  const outputCount = objectives.reduce((s, o) => s + o.outcomes.reduce((a, u) => a + u.outputs.length, 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col my-8">
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'create' ? 'Create New Project' : 'Edit Project'}
            </h2>
            <p className="text-orange-100 text-sm">
              Set up a new program with comprehensive project information, financial details, and results framework.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-white/90 hover:text-white p-1">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-gray-200 px-6 py-3 gap-4 flex-shrink-0">
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  step === s.id ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {s.label}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Project Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
                <p className="text-sm text-gray-500">Enter basic project information and management details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Code *</label>
                  <input
                    type="text"
                    value={form.projectCode}
                    onChange={(e) => setForm({ ...form, projectCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter project code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Enter project title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {projectTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Lead *</label>
                <select
                  required
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Project Lead</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Goal *</label>
                <textarea
                  required
                  value={form.projectGoal}
                  onChange={(e) => setForm({ ...form, projectGoal: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter project goal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
                <BlobFileUpload
                  uploadType={{ type: 'project', projectName: form.title || 'new-project', subfolder: 'supporting' }}
                  onUploaded={(url, pathname, file) =>
                    setSupportingDocuments(prev => [...prev, { url, pathname, name: file.name }])
                  }
                  label="Upload detailed project summary"
                  hint="PDF, DOC, DOCX up to 10MB"
                />
                {supportingDocuments.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {supportingDocuments.map((d, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                          {d.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => setSupportingDocuments(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        form.categories.includes(cat) ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Countries *</label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto grid grid-cols-2 gap-1">
                  {AFRICAN_COUNTRIES.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.countries.includes(c)}
                        onChange={() => toggleCountry(c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
                {form.countries.length > 0 && <p className="text-xs text-gray-500 mt-1">Selected: {form.countries.join(', ')}</p>}
              </div>

              {form.countries.includes('Zimbabwe') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provinces/States (Zimbabwe)</label>
                  <div className="flex flex-wrap gap-2">
                    {ZIMBABWE_PROVINCES.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.provinces.includes(p)} onChange={() => toggleProvince(p)} />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Frequency</label>
                <div className="flex gap-4">
                  {EVALUATION_FREQUENCY.map((ef) => (
                    <label key={ef.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="evalFreq"
                        value={ef.value}
                        checked={form.evaluationFrequency === ef.value}
                        onChange={() => setForm({ ...form, evaluationFrequency: ef.value })}
                      />
                      {ef.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Methodologies</label>
                <div className="flex flex-wrap gap-2">
                  {METHODOLOGIES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => toggleMethodology(m.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        form.methodologies.includes(m.value) ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Implementing Organizations (up to 10)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Other organization"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const el = e.target as HTMLInputElement
                        if (el.value && form.implementingOrgs.length < 10) {
                          setForm({ ...form, implementingOrgs: [...form.implementingOrgs, el.value] })
                          el.value = ''
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded-md text-sm"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                      if (input?.value && form.implementingOrgs.length < 10) {
                        setForm({ ...form, implementingOrgs: [...form.implementingOrgs, input.value] })
                        input.value = ''
                      }
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.implementingOrgs.map((org, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                      {org}
                      <button type="button" onClick={() => setForm({ ...form, implementingOrgs: form.implementingOrgs.filter((_, j) => j !== i) })} className="text-red-600">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Team</label>
                <p className="text-xs text-gray-500 mb-2">Selected team members: {form.teamMemberIds.length}</p>
                <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {allUsers.map((u) => (
                    <label key={u.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.teamMemberIds.includes(u.id)}
                        onChange={() => toggleTeamMember(u.id)}
                      />
                      {u.firstName} {u.lastName} - {(u as any).role || 'User'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Financial Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Financial Details</h3>
                <p className="text-sm text-gray-500">Specify budget and funding source information</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget *</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.totalBudget}
                  onChange={(e) => setForm({ ...form, totalBudget: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter total budget"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Source *</label>
                <input
                  type="text"
                  value={form.fundingSource}
                  onChange={(e) => setForm({ ...form, fundingSource: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter funding source"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Funding Source Details &amp; Budget Breakdown</label>
                <BlobFileUpload
                  uploadType={{ type: 'project', projectName: form.title || 'new-project', subfolder: 'funding' }}
                  onUploaded={(url, pathname, file) =>
                    setFundingDocuments(prev => [...prev, { url, pathname, name: file.name }])
                  }
                  label="Upload budget breakdown documents"
                  hint="PDF, XLSX, DOCX up to 10MB"
                  accept=".pdf,.xlsx,.xls,.docx,.doc"
                />
                {fundingDocuments.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {fundingDocuments.map((d, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
                          {d.name}
                        </a>
                        <button
                          type="button"
                          onClick={() => setFundingDocuments(prev => prev.filter((_, j) => j !== i))}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">Grants e-requisite Integration</p>
                <p className="text-sm text-gray-600 mt-1">
                  This project will be connected to the Grants e-requisite platform for real-time budget tracking and performance monitoring.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Results Framework */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Results Framework</h3>
                  <p className="text-sm text-gray-500">Define objectives, outcomes, and outputs with comprehensive monitoring indicators</p>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Project Duration</label>
                    <select
                      value={projectDurationYears}
                      onChange={(e) => setProjectDurationYears(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((y) => (
                        <option key={y} value={y}>{y} Year{y > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={addObjective} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                    <PlusIcon className="w-4 h-4" /> Add Objective
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {objectives.map((obj, oi) => (
                  <div key={obj.id} className="border border-blue-200 rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-blue-50 cursor-pointer"
                      onClick={() => setExpandedObj(s => (s.has(obj.id) ? new Set([...s].filter(x => x !== obj.id)) : new Set([...s, obj.id])))}
                    >
                      <div className="flex items-center gap-2">
                        {expandedObj.has(obj.id) ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
                        <span className="font-medium">Objective {oi + 1}</span>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeObjective(obj.id) }} className="text-red-600 p-1">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    {expandedObj.has(obj.id) && (
                      <div className="p-4 space-y-4 border-t border-blue-100">
                        <div>
                          <label className="block text-sm font-medium mb-1">Objective Title *</label>
                          <input
                            type="text"
                            value={obj.title}
                            onChange={(e) => updateObjective(obj.id, { title: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Enter objective title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={obj.description}
                            onChange={(e) => updateObjective(obj.id, { description: e.target.value })}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                            placeholder="Describe the objective"
                          />
                        </div>

                        {/* Outcomes */}
                        <div className="border-l-4 border-green-200 pl-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Outcomes</span>
                            <button type="button" onClick={() => addOutcome(obj.id)} className="text-sm text-green-600 font-medium flex items-center gap-1">
                              <PlusIcon className="w-4 h-4" /> Add Outcome
                            </button>
                          </div>
                          {obj.outcomes.map((out, ui) => (
                            <div key={out.id} className="border border-green-200 rounded-lg mb-3 overflow-hidden">
                              <div
                                className="flex items-center justify-between px-3 py-2 bg-green-50 cursor-pointer"
                                onClick={() => setExpandedOut(s => (s.has(out.id) ? new Set([...s].filter(x => x !== out.id)) : new Set([...s, out.id])))}
                              >
                                <div className="flex items-center gap-2">
                                  {expandedOut.has(out.id) ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                                  <span className="font-medium text-sm">Outcome {ui + 1}</span>
                                </div>
                                <button type="button" onClick={(e) => { e.stopPropagation(); removeOutcome(obj.id, out.id) }} className="text-red-600 p-1">
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                              {expandedOut.has(out.id) && (
                                <div className="p-3 space-y-3 border-t border-green-100">
                                  <div>
                                    <label className="block text-xs font-medium mb-1">Outcome Title *</label>
                                    <input
                                      type="text"
                                      value={out.title}
                                      onChange={(e) => updateOutcome(obj.id, out.id, { title: e.target.value })}
                                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                      placeholder="Enter outcome title"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium mb-1">Description</label>
                                    <textarea
                                      value={out.description}
                                      onChange={(e) => updateOutcome(obj.id, out.id, { description: e.target.value })}
                                      rows={2}
                                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                      placeholder="Describe the outcome"
                                    />
                                  </div>

                                  {/* Outcome Indicators */}
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-medium">Outcome Indicators</span>
                                      <button type="button" onClick={() => addOutcomeIndicator(obj.id, out.id)} className="text-xs text-green-600">+ Add Indicator</button>
                                    </div>
                                    {out.indicators.map((ind) => (
                                      <div key={ind.id} className="ml-2 p-2 border border-gray-200 rounded bg-gray-50 mb-2">
                                        <div className="flex justify-end">
                                          <button type="button" onClick={() => removeOutcomeIndicator(obj.id, out.id, ind.id)} className="text-red-600 text-xs">Remove</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div className="col-span-2">
                                            <label className="block font-medium mb-0.5">Indicator Description *</label>
                                            <textarea value={ind.description} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { description: e.target.value })} rows={2} className="w-full border rounded px-2 py-1" placeholder="Describe the measurable indicator" />
                                          </div>
                                          <div><label className="block font-medium mb-0.5">Baseline value</label><input type="text" value={ind.baselineValue} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { baselineValue: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                          <div><label className="block font-medium mb-0.5">Baseline unit</label><input type="text" value={ind.baselineUnit} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { baselineUnit: e.target.value })} className="w-full border rounded px-2 py-1" placeholder="e.g. people, %" /></div>
                                          <div className="col-span-2"><label className="block font-medium mb-0.5">Method for monitoring</label><input type="text" value={ind.methodForMonitoring} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { methodForMonitoring: e.target.value })} className="w-full border rounded px-2 py-1" placeholder="How will this be measured?" /></div>
                                          <div><label className="block font-medium mb-0.5">Target Y1</label><input type="text" value={ind.targetYear1} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { targetYear1: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                          <div><label className="block font-medium mb-0.5">Target Y2</label><input type="text" value={ind.targetYear2} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { targetYear2: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                          <div><label className="block font-medium mb-0.5">Target Y3</label><input type="text" value={ind.targetYear3} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { targetYear3: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                          <div><label className="block font-medium mb-0.5">Target unit</label><input type="text" value={ind.targetUnit} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { targetUnit: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                          <div><label className="block font-medium mb-0.5">Frequency</label>
                                            <select value={ind.frequency} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { frequency: e.target.value })} className="w-full border rounded px-2 py-1">
                                              <option value="">Select</option>
                                              {INDICATOR_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                            </select>
                                          </div>
                                          <div><label className="block font-medium mb-0.5">Data Source</label><input type="text" value={ind.dataSource} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { dataSource: e.target.value })} className="w-full border rounded px-2 py-1" placeholder="Where data comes from" /></div>
                                          <div className="col-span-2">
                                            <label className="block font-medium mb-0.5">Disaggregation</label>
                                            <div className="flex flex-wrap gap-1">
                                              {DISAGGREGATION_OPTIONS.map(d => (
                                                <label key={d} className="flex items-center gap-1 text-xs">
                                                  <input type="checkbox" checked={ind.disaggregation.includes(d)} onChange={(e) => updateOutcomeIndicator(obj.id, out.id, ind.id, { disaggregation: e.target.checked ? [...ind.disaggregation, d] : ind.disaggregation.filter(x => x !== d) })} />
                                                  {d}
                                                </label>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Outputs (corresponding to outcome) */}
                                  <div className="border-l-4 border-amber-200 pl-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium">Outputs</span>
                                      <button type="button" onClick={() => addOutput(obj.id, out.id)} className="text-xs text-amber-600">+ Add Output</button>
                                    </div>
                                    {out.outputs.map((op, pi) => (
                                      <div key={op.id} className="border border-amber-200 rounded-lg mb-3 overflow-hidden">
                                        <div
                                          className="flex items-center justify-between px-3 py-2 bg-amber-50 cursor-pointer"
                                          onClick={() => setExpandedOutput(s => (s.has(op.id) ? new Set([...s].filter(x => x !== op.id)) : new Set([...s, op.id])))}
                                        >
                                          <div className="flex items-center gap-2">
                                            {expandedOutput.has(op.id) ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                                            <span className="font-medium text-sm">Output {pi + 1}</span>
                                          </div>
                                          <button type="button" onClick={(e) => { e.stopPropagation(); removeOutput(obj.id, out.id, op.id) }} className="text-red-600 p-1">
                                            <TrashIcon className="w-3 h-3" />
                                          </button>
                                        </div>
                                        {expandedOutput.has(op.id) && (
                                          <div className="p-3 space-y-3 border-t border-amber-100">
                                            <div>
                                              <label className="block text-xs font-medium mb-1">Output Title *</label>
                                              <input
                                                type="text"
                                                value={op.title}
                                                onChange={(e) => updateOutput(obj.id, out.id, op.id, { title: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                                placeholder="Enter output title"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium mb-1">Description</label>
                                              <textarea
                                                value={op.description}
                                                onChange={(e) => updateOutput(obj.id, out.id, op.id, { description: e.target.value })}
                                                rows={2}
                                                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                                                placeholder="Describe the output"
                                              />
                                            </div>
                                            <div>
                                              <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-medium">Output Indicators</span>
                                                <button type="button" onClick={() => addOutputIndicator(obj.id, out.id, op.id)} className="text-xs text-amber-600">+ Add Indicator</button>
                                              </div>
                                              {op.indicators.length === 0 ? (
                                                <p className="text-xs text-gray-500">No indicators defined yet. Click Add Indicator to get started.</p>
                                              ) : (
                                                op.indicators.map((ind) => (
                                                  <div key={ind.id} className="ml-2 p-2 border border-gray-200 rounded bg-gray-50 mb-2">
                                                    <div className="flex justify-end">
                                                      <button type="button" onClick={() => removeOutputIndicator(obj.id, out.id, op.id, ind.id)} className="text-red-600 text-xs">Remove</button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div className="col-span-2"><label className="block font-medium mb-0.5">Indicator Description *</label><textarea value={ind.description} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { description: e.target.value })} rows={2} className="w-full border rounded px-2 py-1" /></div>
                                                      <div><label className="block font-medium mb-0.5">Baseline</label><input type="text" value={ind.baselineValue} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { baselineValue: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                                      <div><label className="block font-medium mb-0.5">Target Y1</label><input type="text" value={ind.targetYear1} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { targetYear1: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                                      <div><label className="block font-medium mb-0.5">Target Y2</label><input type="text" value={ind.targetYear2} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { targetYear2: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                                      <div><label className="block font-medium mb-0.5">Target Y3</label><input type="text" value={ind.targetYear3} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { targetYear3: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                                      <div><label className="block font-medium mb-0.5">Frequency</label><select value={ind.frequency} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { frequency: e.target.value })} className="w-full border rounded px-2 py-1"><option value="">Select</option>{INDICATOR_FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                                                      <div><label className="block font-medium mb-0.5">Data Source</label><input type="text" value={ind.dataSource} onChange={(e) => updateOutputIndicator(obj.id, out.id, op.id, ind.id, { dataSource: e.target.value })} className="w-full border rounded px-2 py-1" /></div>
                                                    </div>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
                <span>Objectives: {objCount}</span>
                <span>Outcomes: {outCount}</span>
                <span>Outputs: {outputCount}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t mt-6 gap-4">
            <div className="flex gap-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
              )}
              {step < 3 && (
                <button type="button" onClick={() => setStep(step + 1)} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                  Next
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                {mode === 'create' ? 'Create Project' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
