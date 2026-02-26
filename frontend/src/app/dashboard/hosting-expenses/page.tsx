'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ServerStackIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FolderIcon,
  ArrowDownTrayIcon,
  BellAlertIcon,
  LinkIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { hostingExpensesAPI, projectsAPI } from '@/lib/api'
import { uploadToBlob } from '@/lib/blobStorage'

interface HostingExpense {
  id: string
  projectId?: string
  project?: { id: string; title: string }
  amount: number
  currency: string
  provider?: string
  billingPeriodStart?: string
  billingPeriodEnd?: string
  description?: string
  invoiceReference?: string
  paymentDate?: string
  paymentMethod?: string
  status: string
  category: string
  hostingLink?: string
  attachmentUrls?: { url: string; name: string }[]
  createdAt: string
}

interface Project {
  id: string
  title: string
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'paid', label: 'Paid' },
  { value: 'reimbursed', label: 'Reimbursed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CATEGORY_OPTIONS = [
  { value: 'hosting', label: 'Hosting' },
  { value: 'domain', label: 'Domain' },
  { value: 'ssl', label: 'SSL' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' },
]

const defaultForm = {
  projectId: '',
  amount: '',
  currency: 'USD',
  provider: '',
  billingPeriodStart: '',
  billingPeriodEnd: '',
  description: '',
  invoiceReference: '',
  paymentDate: '',
  paymentMethod: '',
  status: 'draft',
  category: 'hosting',
  hostingLink: '',
  attachmentUrls: [] as { url: string; name: string }[],
}

export default function HostingExpensesPage() {
  const searchParams = useSearchParams()
  const [expenses, setExpenses] = useState<HostingExpense[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<HostingExpense | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [providerFilter, setProviderFilter] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20
  const [exporting, setExporting] = useState(false)
  const [upcomingRenewals, setUpcomingRenewals] = useState<HostingExpense[]>([])
  const [stats, setStats] = useState<{
    totalAmount: number
    totalCount: number
    byProject: { projectId: string; projectTitle: string; total: number }[]
    byProvider: { provider: string; total: number }[]
    byMonth?: { month: string; total: number; count: number }[]
  } | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    loadExpenses()
  }, [page, projectFilter, statusFilter, providerFilter])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    const pid = searchParams?.get('projectId')
    if (pid) setProjectFilter(pid)
  }, [searchParams])

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    loadUpcomingRenewals()
  }, [])

  const loadUpcomingRenewals = async () => {
    try {
      const list = await hostingExpensesAPI.getUpcomingRenewals(5)
      setUpcomingRenewals(Array.isArray(list) ? list : [])
    } catch {
      setUpcomingRenewals([])
    }
  }

  const loadStats = async () => {
    try {
      const res = await hostingExpensesAPI.getStats()
      setStats(res)
    } catch {
      setStats(null)
    }
  }

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page, limit }
      if (projectFilter) params.projectId = projectFilter
      if (statusFilter) params.status = statusFilter
      if (providerFilter) params.provider = providerFilter
      const res = await hostingExpensesAPI.getAll(params)
      setExpenses(res.expenses || [])
      setTotalCount(res.total || 0)
    } catch (err) {
      console.error('Failed to load expenses:', err)
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getProjects({ limit: 500 })
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.projects)
        ? res.projects
        : Array.isArray(res)
        ? res
        : []
      setProjects(list)
    } catch {
      setProjects([])
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setShowModal(true)
  }

  const openEdit = (e: HostingExpense) => {
    setEditing(e)
    setForm({
      projectId: e.projectId || '',
      amount: String(e.amount ?? ''),
      currency: e.currency || 'USD',
      provider: e.provider || '',
      billingPeriodStart: e.billingPeriodStart
        ? e.billingPeriodStart.slice(0, 10)
        : '',
      billingPeriodEnd: e.billingPeriodEnd ? e.billingPeriodEnd.slice(0, 10) : '',
      description: e.description || '',
      invoiceReference: e.invoiceReference || '',
      paymentDate: e.paymentDate ? e.paymentDate.slice(0, 10) : '',
      paymentMethod: e.paymentMethod || '',
      status: e.status || 'draft',
      category: e.category || 'hosting',
      hostingLink: e.hostingLink || '',
      attachmentUrls: e.attachmentUrls || [],
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        projectId: form.projectId || undefined,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        provider: form.provider || undefined,
        billingPeriodStart: form.billingPeriodStart || undefined,
        billingPeriodEnd: form.billingPeriodEnd || undefined,
        description: form.description || undefined,
        invoiceReference: form.invoiceReference || undefined,
        paymentDate: form.paymentDate || undefined,
        paymentMethod: form.paymentMethod || undefined,
        status: form.status,
        category: form.category,
        hostingLink: form.hostingLink || undefined,
        attachmentUrls: form.attachmentUrls?.length ? form.attachmentUrls : undefined,
      }
      if (editing) {
        await hostingExpensesAPI.update(editing.id, payload)
      } else {
        await hostingExpensesAPI.create(payload)
      }
      setShowModal(false)
      loadExpenses()
      loadStats()
      loadUpcomingRenewals()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save expense')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await hostingExpensesAPI.delete(id)
      setDeleteConfirm(null)
      loadExpenses()
      loadStats()
      loadUpcomingRenewals()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      Number(amount)
    )

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params: Record<string, any> = { page: 1, limit: 5000 }
      if (projectFilter) params.projectId = projectFilter
      if (statusFilter) params.status = statusFilter
      if (providerFilter) params.provider = providerFilter
      const res = await hostingExpensesAPI.getAll(params)
      const list = res.expenses || []
      const headers = ['Provider', 'Project', 'Amount', 'Currency', 'Category', 'Status', 'Billing Start', 'Billing End', 'Payment Date', 'Description', 'Invoice Ref']
      const rows = list.map((e: HostingExpense) => [
        e.provider ?? '',
        e.project?.title ?? '',
        e.amount ?? '',
        e.currency ?? 'USD',
        e.category ?? '',
        e.status ?? '',
        e.billingPeriodStart ?? '',
        e.billingPeriodEnd ?? '',
        e.paymentDate ?? '',
        (e.description ?? '').replace(/"/g, '""'),
        e.invoiceReference ?? '',
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map((r: string[]) => r.map((c: string | number) => `"${String(c)}"`).join(',')),
      ].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hosting-expenses-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(totalCount / limit) || 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hosting Expenses</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track hosting and infrastructure payments for projects
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total paid</p>
              <p className="text-xl font-semibold text-white">
                {stats ? formatCurrency(stats.totalAmount) : '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-green-900/30 to-green-800/20 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <ServerStackIcon className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Paid expenses</p>
              <p className="text-xl font-semibold text-white">
                {stats?.totalCount ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-amber-900/30 to-amber-800/20 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <ChartBarIcon className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Top provider</p>
              <p className="text-xl font-semibold text-white truncate max-w-[140px]">
                {stats?.byProvider?.[0]?.provider ?? '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <FolderIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Projects with costs</p>
              <p className="text-xl font-semibold text-white">
                {stats?.byProject?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming renewals */}
      {upcomingRenewals.length > 0 && (
        <div className="rounded-lg border border-amber-900/30 bg-amber-900/10 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-amber-200">
            <BellAlertIcon className="h-5 w-5" />
            Upcoming renewals (next billing end)
          </h3>
          <ul className="space-y-2">
            {upcomingRenewals.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-3 py-2 text-sm"
              >
                <span className="text-gray-300">
                  {e.provider || '—'} · {e.project?.title || 'Unassigned'}
                </span>
                <span className="text-amber-200">
                  {formatDate(e.billingPeriodEnd)} · {formatCurrency(Number(e.amount), e.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expenditures over time */}
      {stats?.byMonth && stats.byMonth.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-sm font-medium text-gray-400">
            Expenditures over time
          </h3>
          <div className="flex items-end gap-2 h-48">
            {stats.byMonth.map((m) => {
              const max = Math.max(...stats.byMonth!.map((x) => x.total), 1)
              const pct = (m.total / max) * 100
              const label = m.month ? `${m.month.slice(0, 4)}-${m.month.slice(5)}` : '—'
              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${label}: ${formatCurrency(m.total)}`}
                >
                  <div
                    className="w-full min-h-[4px] rounded-t bg-gradient-to-t from-blue-600 to-cyan-500 transition-all"
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                  <span className="text-[10px] text-gray-500 rotate-0 truncate max-w-full">
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* By project & by provider charts */}
      {stats && (stats.byProject.length > 0 || stats.byProvider.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-sm font-medium text-gray-400">
              Hosting cost by project
            </h3>
            <div className="space-y-3">
              {stats.byProject.slice(0, 6).map((p) => {
                const max = Math.max(...stats.byProject.map((x) => x.total), 1)
                const pct = (p.total / max) * 100
                return (
                  <div key={p.projectId || '_none'} className="flex items-center gap-3">
                    <span className="w-32 truncate text-sm text-gray-300">
                      {p.projectTitle}
                    </span>
                    <div className="flex-1 h-6 rounded bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-blue-600 to-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-20 text-right">
                      {formatCurrency(p.total)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h3 className="mb-4 text-sm font-medium text-gray-400">
              Hosting cost by provider
            </h3>
            <div className="space-y-3">
              {stats.byProvider.slice(0, 6).map((p) => {
                const max = Math.max(...stats.byProvider.map((x) => x.total), 1)
                const pct = (p.total / max) * 100
                return (
                  <div key={p.provider} className="flex items-center gap-3">
                    <span className="w-32 truncate text-sm text-gray-300">
                      {p.provider}
                    </span>
                    <div className="flex-1 h-6 rounded bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded bg-gradient-to-r from-green-600 to-green-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-white w-20 text-right">
                      {formatCurrency(p.total)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Provider</label>
            <input
              type="text"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              placeholder="e.g. AWS, Azure"
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setProjectFilter('')
                setStatusFilter('')
                setProviderFilter('')
              }}
              className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ServerStackIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-2">No hosting expenses yet</p>
            <button
              onClick={openCreate}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Payment date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">
                    Link
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 text-sm text-white">
                      {exp.provider || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {exp.project?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">
                      {formatCurrency(Number(exp.amount), exp.currency)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(exp.billingPeriodStart)} –{' '}
                      {formatDate(exp.billingPeriodEnd)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          exp.status === 'paid'
                            ? 'bg-green-900/50 text-green-300'
                            : exp.status === 'draft'
                            ? 'bg-amber-900/50 text-amber-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(exp.paymentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {exp.hostingLink ? (
                          <a
                            href={exp.hostingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1"
                            title="Hosting link"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </a>
                        ) : null}
                        {exp.attachmentUrls?.length ? (
                          <span
                            className="flex items-center gap-1 text-gray-400"
                            title={`${exp.attachmentUrls.length} attachment(s)`}
                          >
                            <PaperClipIcon className="h-4 w-4" />
                            {exp.attachmentUrls.length}
                          </span>
                        ) : null}
                        {!exp.hostingLink && !exp.attachmentUrls?.length ? '—' : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(exp)}
                        className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(exp.id)}
                        className="ml-1 rounded p-1 text-gray-400 hover:bg-red-900/30 hover:text-red-300"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <p className="text-sm text-gray-400">
              Page {page} of {totalPages} · {totalCount} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-white/20 px-3 py-1 text-sm text-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-white/20 px-3 py-1 text-sm text-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-granite-800 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editing ? 'Edit expense' : 'Add expense'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Project (optional)
                  </label>
                  <select
                    value={form.projectId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, projectId: e.target.value }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  >
                    <option value="">— None —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  {form.projectId && (
                    <Link
                      href={`/dashboard/tracking?id=${form.projectId}`}
                      target="_blank"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                    >
                      <LinkIcon className="h-3 w-3" />
                      Open project tracking
                    </Link>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={form.provider}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, provider: e.target.value }))
                    }
                    placeholder="e.g. AWS, Azure"
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Billing period start
                  </label>
                  <input
                    type="date"
                    value={form.billingPeriodStart}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        billingPeriodStart: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Billing period end
                  </label>
                  <input
                    type="date"
                    value={form.billingPeriodEnd}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        billingPeriodEnd: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="e.g. Server hosting - Project X"
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Invoice reference
                  </label>
                  <input
                    type="text"
                    value={form.invoiceReference}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        invoiceReference: e.target.value,
                      }))
                    }
                    placeholder="Provider invoice #"
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Payment date
                  </label>
                  <input
                    type="date"
                    value={form.paymentDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, paymentDate: e.target.value }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Payment method
                  </label>
                  <input
                    type="text"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        paymentMethod: e.target.value,
                      }))
                    }
                    placeholder="e.g. Bank transfer"
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Hosting / provider link
                </label>
                <input
                  type="url"
                  value={form.hostingLink}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hostingLink: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-gray-500"
                />
                <p className="mt-0.5 text-xs text-gray-500">
                  Link to provider dashboard or hosting panel
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-400">
                  Attach documents
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                    className="hidden"
                    id="hosting-expense-upload"
                    onChange={async (e) => {
                      const files = e.target.files
                      if (!files?.length) return
                      setUploadingFile(true)
                      for (const file of Array.from(files)) {
                        try {
                          const res = await uploadToBlob(file, {
                            type: 'hostingExpense',
                            provider: form.provider || undefined,
                            expenseId: editing?.id || 'new',
                          })
                          setForm((f) => ({
                            ...f,
                            attachmentUrls: [
                              ...(f.attachmentUrls || []),
                              { url: res.url, name: file.name },
                            ],
                          }))
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Upload failed')
                        }
                      }
                      setUploadingFile(false)
                      e.target.value = ''
                    }}
                  />
                  <label
                    htmlFor="hosting-expense-upload"
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 px-4 py-3 text-sm text-gray-400 hover:border-white/40 hover:bg-white/5 ${uploadingFile ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    <PaperClipIcon className="h-4 w-4" />
                    {uploadingFile ? 'Uploading…' : 'Choose files (PDF, DOC, images)'}
                  </label>
                  {form.attachmentUrls?.length ? (
                    <ul className="space-y-1">
                      {form.attachmentUrls.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-sm"
                        >
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-blue-400 hover:underline"
                          >
                            {a.name}
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                attachmentUrls: f.attachmentUrls?.filter((_, j) => j !== i) || [],
                              }))
                            }
                            className="text-red-400 hover:text-red-300"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-lg border border-white/10 bg-granite-800 p-6 shadow-xl">
            <p className="text-white">
              Are you sure you want to delete this expense?
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
