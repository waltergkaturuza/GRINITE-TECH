'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BanknotesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import { hostingExpensesAPI, invoicesAPI, ledgerAPI, projectsAPI } from '@/lib/api'

interface LedgerAccount {
  id: string
  name: string
  type: string
  currency: string
  openingBalance: number
  description?: string
  isActive: boolean
}

interface LedgerEntry {
  id: string
  accountId: string
  entryDate: string
  type: string
  amount: number
  description?: string
  referenceType?: string
  referenceId?: string
  category?: string
  projectId?: string | null
  projectTitle?: string
  projectCode?: string
}

interface ProjectOption {
  id: string
  title: string
  projectCode?: string
  status?: string
  clientId?: string
}

interface InvoiceOption {
  id: number | string
  invoice_number?: string
  total_amount?: number
  amount_due?: number
  project_id?: string
  client_id?: string
  client_name?: string
  document_type?: 'invoice' | 'quotation' | 'receipt' | string
  status?: string
  notes?: string
}

interface HostingOption {
  id: string
  amount: number
  provider?: string
  projectId?: string
  description?: string
}

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'petty_cash', label: 'Petty Cash' },
  { value: 'receivables', label: 'Receivables' },
  { value: 'payables', label: 'Payables' },
  { value: 'other', label: 'Other' },
]

const inputClass =
  'w-full rounded-md border border-white/20 bg-granite-900 px-3 py-2 text-white [color-scheme:dark]'

type Purpose = {
  id: string
  label: string
  group: 'Bank charges' | 'Money in' | 'Money out'
  storedType: 'debit' | 'credit'
  category: string
  needsProject: boolean
  linkInvoice?: boolean
  linkHosting?: boolean
  amountOnly: boolean
  description: (date: string, accountName: string) => string
}

function monthLabel(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

const PURPOSES: Purpose[] = [
  {
    id: 'bank_charge_monthly',
    label: 'Monthly bank charges',
    group: 'Bank charges',
    storedType: 'credit',
    category: 'bank_charge_monthly',
    needsProject: false,
    amountOnly: true,
    description: (date, account) => `${account} monthly service fee – ${monthLabel(date)}`,
  },
  {
    id: 'bank_charge_rtgs',
    label: 'RTGS / ZIPIT charges',
    group: 'Bank charges',
    storedType: 'credit',
    category: 'bank_charge_rtgs',
    needsProject: false,
    amountOnly: true,
    description: (date, account) => `${account} RTGS/ZIPIT charge – ${monthLabel(date)}`,
  },
  {
    id: 'bank_charge_cash',
    label: 'Cash deposit / withdrawal fee',
    group: 'Bank charges',
    storedType: 'credit',
    category: 'bank_charge_cash',
    needsProject: false,
    amountOnly: true,
    description: (date, account) => `${account} cash handling fee – ${monthLabel(date)}`,
  },
  {
    id: 'bank_charge_card',
    label: 'Card / POS charges',
    group: 'Bank charges',
    storedType: 'credit',
    category: 'bank_charge_card',
    needsProject: false,
    amountOnly: true,
    description: (date, account) => `${account} card/POS charges – ${monthLabel(date)}`,
  },
  {
    id: 'bank_charge_statement',
    label: 'Statement / enquiry fee',
    group: 'Bank charges',
    storedType: 'credit',
    category: 'bank_charge_statement',
    needsProject: false,
    amountOnly: true,
    description: (date, account) => `${account} statement fee – ${monthLabel(date)}`,
  },
  {
    id: 'bank_charge_other',
    label: 'Other bank charges',
    group: 'Bank charges',
    storedType: 'credit',
    category: 'bank_charge_other',
    needsProject: false,
    amountOnly: true,
    description: (date, account) => `${account} bank charges – ${monthLabel(date)}`,
  },
  {
    id: 'client_payment',
    label: 'Client payment received',
    group: 'Money in',
    storedType: 'debit',
    category: 'client_payment',
    needsProject: true,
    linkInvoice: true,
    amountOnly: false,
    description: () => 'Client payment received',
  },
  {
    id: 'transfer_in',
    label: 'Transfer in',
    group: 'Money in',
    storedType: 'debit',
    category: 'transfer_in',
    needsProject: false,
    amountOnly: false,
    description: () => 'Transfer in',
  },
  {
    id: 'other_in',
    label: 'Other money in',
    group: 'Money in',
    storedType: 'debit',
    category: 'other_in',
    needsProject: false,
    amountOnly: false,
    description: () => '',
  },
  {
    id: 'project_expense',
    label: 'Project expense',
    group: 'Money out',
    storedType: 'credit',
    category: 'project_expense',
    needsProject: true,
    amountOnly: false,
    description: () => 'Project expense',
  },
  {
    id: 'hosting',
    label: 'Hosting / domain / cloud',
    group: 'Money out',
    storedType: 'credit',
    category: 'hosting',
    needsProject: true,
    linkHosting: true,
    amountOnly: false,
    description: () => 'Hosting / infrastructure',
  },
  {
    id: 'salary',
    label: 'Salary / contractor',
    group: 'Money out',
    storedType: 'credit',
    category: 'salary',
    needsProject: false,
    amountOnly: false,
    description: () => 'Salary / contractor payment',
  },
  {
    id: 'tax',
    label: 'Tax / VAT / PAYE',
    group: 'Money out',
    storedType: 'credit',
    category: 'tax',
    needsProject: false,
    amountOnly: false,
    description: () => 'Tax payment',
  },
  {
    id: 'transfer_out',
    label: 'Transfer out',
    group: 'Money out',
    storedType: 'credit',
    category: 'transfer_out',
    needsProject: false,
    amountOnly: false,
    description: () => 'Transfer out',
  },
  {
    id: 'other_out',
    label: 'Other money out',
    group: 'Money out',
    storedType: 'credit',
    category: 'other_out',
    needsProject: false,
    amountOnly: false,
    description: () => '',
  },
]

const PURPOSE_GROUPS = ['Bank charges', 'Money in', 'Money out'] as const

function isMoneyIn(type: string) {
  return type === 'debit'
}

function entryTypeLabel(type: string) {
  return isMoneyIn(type) ? 'Credit' : 'Debit'
}

function purposeFor(category?: string, type?: string) {
  return (
    PURPOSES.find((item) => item.id === category || item.category === category) ||
    PURPOSES.find((item) => (type === 'debit' ? item.id === 'other_in' : item.id === 'other_out')) ||
    PURPOSES[0]
  )
}

function asList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const nested = record.data || record.items || record.projects || record.invoices || record.expenses
    if (Array.isArray(nested)) return nested as T[]
  }
  return []
}

function clientNameFrom(row: Record<string, any>) {
  if (row.client_name) return String(row.client_name)
  const client = row.client || {}
  return [client.firstName, client.lastName].filter(Boolean).join(' ') || client.email || ''
}

function mapProject(row: Record<string, any>): ProjectOption {
  return {
    id: String(row.id),
    title: row.title || '',
    projectCode: row.projectCode || row.project_code,
    status: row.status,
    clientId: row.client?.id || row.client_id || row.clientId,
  }
}

function mapInvoice(row: Record<string, any>): InvoiceOption {
  return {
    id: row.id,
    invoice_number: row.invoice_number,
    total_amount: Number(row.total_amount) || 0,
    amount_due: Number(row.amount_due ?? row.balance_due ?? row.total_amount) || 0,
    project_id: row.project_id || row.project?.id,
    client_id: row.client_id || row.client?.id,
    client_name: clientNameFrom(row),
    document_type: row.document_type || 'invoice',
    status: row.status,
    notes: row.notes || '',
  }
}

function projectTokens(project?: ProjectOption | null) {
  if (!project) return []
  return [project.projectCode, project.title]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/[\s_\-/]+/))
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 4)
}

function documentMatchesProject(doc: InvoiceOption, project?: ProjectOption | null) {
  if (!project) return true
  if (doc.project_id && String(doc.project_id) === String(project.id)) return true
  const haystack = [
    doc.invoice_number,
    doc.client_name,
    doc.notes,
    doc.project_id,
  ]
    .join(' ')
    .toLowerCase()
  return projectTokens(project).some((token) => haystack.includes(token))
}

const emptyEntryForm = () => ({
  purposeId: 'bank_charge_monthly',
  entryDate: new Date().toISOString().slice(0, 10),
  type: 'credit' as string,
  amount: '',
  description: '',
  projectId: '',
  invoiceId: '',
  hostingId: '',
})

export default function AccountsPage() {
  const [accountsWithBalances, setAccountsWithBalances] = useState<
    { account: LedgerAccount; balance: number }[]
  >([])
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccount | null>(null)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [invoices, setInvoices] = useState<InvoiceOption[]>([])
  const [hosting, setHosting] = useState<HostingOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<LedgerAccount | null>(null)
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [purposeFilter, setPurposeFilter] = useState('all')

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'bank',
    currency: 'USD',
    openingBalance: '',
    description: '',
  })

  const [entryForm, setEntryForm] = useState(emptyEntryForm())

  useEffect(() => {
    loadAccounts()
    loadLookups()
  }, [])

  useEffect(() => {
    if (selectedAccount) loadEntries(selectedAccount.id)
  }, [selectedAccount])

  const loadLookups = async () => {
    const [projectRes, invoiceRes, receiptRes, hostingRes] = await Promise.allSettled([
      projectsAPI.getProjects({ limit: 500 }),
      invoicesAPI.getInvoices({ documentType: 'invoice', limit: 300 }),
      invoicesAPI.getInvoices({ documentType: 'receipt', limit: 300 }),
      hostingExpensesAPI.getAll({ limit: 100 }),
    ])
    if (projectRes.status === 'fulfilled') {
      setProjects(asList<Record<string, any>>(projectRes.value).map(mapProject))
    }
    const docs: InvoiceOption[] = []
    if (invoiceRes.status === 'fulfilled') docs.push(...asList<Record<string, any>>(invoiceRes.value).map(mapInvoice))
    if (receiptRes.status === 'fulfilled') docs.push(...asList<Record<string, any>>(receiptRes.value).map(mapInvoice))
    setInvoices(docs.filter((doc) => doc.document_type !== 'quotation'))
    if (hostingRes.status === 'fulfilled') setHosting(asList<HostingOption>(hostingRes.value))
  }

  const loadAccounts = async () => {
    setLoading(true)
    try {
      const data = await ledgerAPI.getAccountsWithBalances()
      setAccountsWithBalances(Array.isArray(data) ? data : [])
    } catch {
      setAccountsWithBalances([])
    } finally {
      setLoading(false)
    }
  }

  const loadEntries = async (accountId: string) => {
    try {
      const res = await ledgerAPI.getEntries(accountId, { limit: 200 })
      setEntries(res.entries || [])
    } catch {
      setEntries([])
    }
  }

  const selectedPurpose = purposeFor(entryForm.purposeId, entryForm.type)

  const applyPurpose = (purposeId: string, date = entryForm.entryDate) => {
    const purpose = purposeFor(purposeId)
    setEntryForm((current) => ({
      ...current,
      purposeId: purpose.id,
      type: purpose.storedType,
      description: purpose.description(date, selectedAccount?.name || 'Bank'),
      invoiceId: purpose.linkInvoice ? current.invoiceId : '',
      hostingId: purpose.linkHosting ? current.hostingId : '',
      projectId: purpose.needsProject ? current.projectId : current.projectId,
    }))
  }

  const openCreateAccount = () => {
    setEditingAccount(null)
    setAccountForm({
      name: '',
      type: 'bank',
      currency: 'USD',
      openingBalance: '',
      description: '',
    })
    setShowAccountModal(true)
  }

  const openEditAccount = (account: LedgerAccount) => {
    setEditingAccount(account)
    setAccountForm({
      name: account.name,
      type: account.type || 'bank',
      currency: account.currency || 'USD',
      openingBalance: String(account.openingBalance ?? 0),
      description: account.description || '',
    })
    setShowAccountModal(true)
  }

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        name: accountForm.name,
        type: accountForm.type,
        currency: accountForm.currency,
        openingBalance: parseFloat(accountForm.openingBalance) || 0,
        description: accountForm.description || undefined,
      }
      if (editingAccount) await ledgerAPI.updateAccount(editingAccount.id, payload)
      else await ledgerAPI.createAccount(payload)
      setShowAccountModal(false)
      loadAccounts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAccount = async (id: string) => {
    try {
      await ledgerAPI.deleteAccount(id)
      setDeleteConfirm(null)
      if (selectedAccount?.id === id) setSelectedAccount(null)
      loadAccounts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const openCreateEntry = () => {
    setEditingEntry(null)
    const next = emptyEntryForm()
    const purpose = purposeFor(next.purposeId)
    setEntryForm({
      ...next,
      type: purpose.storedType,
      description: purpose.description(next.entryDate, selectedAccount?.name || 'Bank'),
    })
    setShowEntryModal(true)
    loadLookups()
  }
    const purpose = purposeFor(entry.category, entry.type)
    setEditingEntry(entry)
    setEntryForm({
      purposeId: purpose.id,
      entryDate: String(entry.entryDate).slice(0, 10),
      type: entry.type,
      amount: String(entry.amount ?? ''),
      description: entry.description || '',
      projectId: entry.projectId || '',
      invoiceId: entry.referenceType === 'invoice_payment' ? String(entry.referenceId || '') : '',
      hostingId: entry.referenceType === 'hosting_expense' ? String(entry.referenceId || '') : '',
    })
    setShowEntryModal(true)
    loadLookups()
  }
    const invoice = invoices.find((item) => String(item.id) === invoiceId)
    setEntryForm((current) => ({
      ...current,
      invoiceId,
      amount: invoice
        ? String(
            invoice.document_type === 'receipt'
              ? invoice.total_amount ?? current.amount
              : invoice.amount_due ?? invoice.total_amount ?? current.amount,
          )
        : current.amount,
      projectId: invoice?.project_id || current.projectId,
      description: invoice
        ? `${invoice.document_type === 'receipt' ? 'Receipt' : 'Payment'} ${invoice.invoice_number || ''} ${invoice.client_name ? `– ${invoice.client_name}` : ''}`.trim()
        : current.description,
    }))
  }

  const handleHostingChange = (hostingId: string) => {
    const item = hosting.find((row) => row.id === hostingId)
    setEntryForm((current) => ({
      ...current,
      hostingId,
      amount: item ? String(item.amount) : current.amount,
      projectId: item?.projectId || current.projectId,
      description: item
        ? `Hosting ${item.provider || ''} ${item.description || ''}`.trim()
        : current.description,
    }))
  }

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    const purpose = purposeFor(entryForm.purposeId, entryForm.type)
    setSubmitting(true)
    try {
      const payload = {
        accountId: selectedAccount.id,
        entryDate: entryForm.entryDate,
        type: purpose.storedType,
        amount: parseFloat(entryForm.amount) || 0,
        description: entryForm.description || purpose.description(entryForm.entryDate, selectedAccount.name),
        category: purpose.category,
        projectId: entryForm.projectId || suggestedProjectId || undefined,
        referenceType: entryForm.invoiceId
          ? 'invoice_payment'
          : entryForm.hostingId
            ? 'hosting_expense'
            : purpose.category.startsWith('bank_charge')
              ? 'bank_charge'
              : 'manual',
        referenceId: entryForm.invoiceId || entryForm.hostingId || undefined,
      }
      if (editingEntry) await ledgerAPI.updateEntry(editingEntry.id, payload)
      else await ledgerAPI.createEntry(payload)
      setShowEntryModal(false)
      setEditingEntry(null)
      loadEntries(selectedAccount.id)
      loadAccounts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save entry')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!selectedAccount) return
    try {
      await ledgerAPI.deleteEntry(id)
      setDeleteEntryId(null)
      loadEntries(selectedAccount.id)
      loadAccounts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete entry')
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount) || 0)
    } catch {
      return `${currency} ${(Number(amount) || 0).toLocaleString()}`
    }
  }

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const currentBalance = accountsWithBalances.find((row) => row.account.id === selectedAccount?.id)?.balance ?? 0
  const totalBalance = accountsWithBalances.reduce((sum, row) => sum + row.balance, 0)

  const filteredEntries = entries.filter((entry) => {
    const purpose = purposeFor(entry.category, entry.type)
    const matchesPurpose = purposeFilter === 'all' || purpose.id === purposeFilter
    const haystack = `${entry.description || ''} ${entry.projectTitle || ''} ${purpose.label}`.toLowerCase()
    return matchesPurpose && haystack.includes(search.toLowerCase())
  })

  const entriesWithBalance = useMemo(() => {
    let running = currentBalance
    return filteredEntries.map((entry) => {
      const row = { ...entry, runningBalance: running }
      const amount = Number(entry.amount) || 0
      running = isMoneyIn(entry.type) ? running - amount : running + amount
      return row
    })
  }, [filteredEntries, currentBalance])

  const monthStats = useMemo(() => {
    const now = new Date()
    const monthRows = entries.filter((entry) => {
      const date = new Date(entry.entryDate)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    const moneyIn = monthRows.filter((entry) => isMoneyIn(entry.type)).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const moneyOut = monthRows.filter((entry) => !isMoneyIn(entry.type)).reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    const charges = monthRows
      .filter((entry) => (entry.category || '').startsWith('bank_charge'))
      .reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
    return { moneyIn, moneyOut, charges }
  }, [entries])

  const suggestedProjectId = useMemo(() => {
    if (entryForm.projectId) return entryForm.projectId
    const text = (entryForm.description || '').toLowerCase()
    if (text.length < 3) return ''
    const match = projects.find((project) => {
      const title = (project.title || '').toLowerCase()
      const code = (project.projectCode || '').toLowerCase()
      return (title && text.includes(title)) || (code && text.includes(code))
    })
    return match?.id || ''
  }, [entryForm.description, entryForm.projectId, projects])

  const selectedProject =
    projects.find((project) => project.id === (entryForm.projectId || suggestedProjectId)) || null

  const invoicesForProject = useMemo(() => {
    const usable = invoices.filter((doc) => doc.document_type === 'invoice' || doc.document_type === 'receipt')
    if (!selectedProject) return usable
    const linked = usable.filter((doc) => documentMatchesProject(doc, selectedProject))
    if (linked.length) return linked
    if (selectedProject.clientId) {
      const byClient = usable.filter((doc) => String(doc.client_id || '') === String(selectedProject.clientId))
      if (byClient.length) return byClient
    }
    return []
  }, [invoices, selectedProject])

  const invoiceOptions = useMemo(() => {
    const usable = invoices.filter((doc) => doc.document_type === 'invoice' || doc.document_type === 'receipt')
    const list = invoicesForProject.length ? invoicesForProject : usable
    if (entryForm.invoiceId && !list.some((doc) => String(doc.id) === entryForm.invoiceId)) {
      const current = usable.find((doc) => String(doc.id) === entryForm.invoiceId)
      if (current) return [current, ...list]
    }
    return list
  }, [invoices, invoicesForProject, entryForm.invoiceId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <p className="mt-1 text-sm text-gray-400">
            Company cashbook: bank charges, client receipts, and project-linked spend.
          </p>
        </div>
        <button
          onClick={openCreateAccount}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Add account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Total balance</p>
          <p className={`text-2xl font-semibold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(totalBalance, selectedAccount?.currency || 'USD')}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Money in this month</p>
          <p className="text-2xl font-semibold text-green-400">{formatCurrency(monthStats.moneyIn, selectedAccount?.currency)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Money out this month</p>
          <p className="text-2xl font-semibold text-red-400">{formatCurrency(monthStats.moneyOut, selectedAccount?.currency)}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Bank charges this month</p>
          <p className="text-2xl font-semibold text-amber-300">{formatCurrency(monthStats.charges, selectedAccount?.currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5">
          <h3 className="border-b border-white/10 px-4 py-3 text-sm font-medium text-gray-400">Accounts</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
            </div>
          ) : accountsWithBalances.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <BanknotesIcon className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-2">No accounts yet</p>
              <button onClick={openCreateAccount} className="mt-2 text-blue-400 hover:underline">
                Create your first account
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {accountsWithBalances.map(({ account, balance }) => (
                <li
                  key={account.id}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer ${
                    selectedAccount?.id === account.id ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                  onClick={() => setSelectedAccount(account)}
                >
                  <div>
                    <p className="font-medium text-white">{account.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{account.type.replace('_', ' ')} · {account.currency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={balance >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(balance, account.currency)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditAccount(account)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirm(account.id)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-red-900/30 hover:text-red-400"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2 rounded-lg border border-white/10 bg-white/5">
          {selectedAccount ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 flex-wrap">
                <div>
                  <h3 className="font-medium text-white">{selectedAccount.name}</h3>
                  <p className="text-sm text-gray-400">
                    Balance:{' '}
                    <span className={currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(currentBalance, selectedAccount.currency)}
                    </span>
                  </p>
                </div>
                <button onClick={openCreateEntry} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                  Add entry
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 py-3 border-b border-white/10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search description or project"
                  className={inputClass}
                />
                <select value={purposeFilter} onChange={(e) => setPurposeFilter(e.target.value)} className={inputClass}>
                  <option value="all">All purposes</option>
                  {PURPOSE_GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {PURPOSES.filter((item) => item.group === group).map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-xs text-gray-400">Date</th>
                      <th className="px-4 py-2 text-left text-xs text-gray-400">Purpose</th>
                      <th className="px-4 py-2 text-left text-xs text-gray-400">Project</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-400">Amount</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-400">Balance</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-400"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entriesWithBalance.map((entry) => {
                      const purpose = purposeFor(entry.category, entry.type)
                      return (
                        <tr key={entry.id} className="border-b border-white/5">
                          <td className="px-4 py-2 text-sm text-gray-300">{formatDate(entry.entryDate)}</td>
                          <td className="px-4 py-2">
                            <div className={`inline-flex items-center gap-1 text-xs ${isMoneyIn(entry.type) ? 'text-green-400' : 'text-red-400'}`}>
                              {isMoneyIn(entry.type) ? <ArrowTrendingUpIcon className="h-4 w-4" /> : <ArrowTrendingDownIcon className="h-4 w-4" />}
                              {purpose.label}
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-[16rem]">{entry.description || entryTypeLabel(entry.type)}</p>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-300">
                            {entry.projectTitle ? (
                              <Link href="/dashboard/projects" className="text-amber-300 hover:underline">
                                {entry.projectCode ? `${entry.projectCode} · ` : ''}{entry.projectTitle}
                              </Link>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium">
                            <span className={isMoneyIn(entry.type) ? 'text-green-400' : 'text-red-400'}>
                              {isMoneyIn(entry.type) ? '+' : '-'}
                              {formatCurrency(Number(entry.amount), selectedAccount.currency)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right text-xs text-gray-400">
                            {formatCurrency(entry.runningBalance, selectedAccount.currency)}
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                            <button onClick={() => openEditEntry(entry)} className="p-1 text-yellow-400 hover:text-yellow-300" title="Edit">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => setDeleteEntryId(entry.id)} className="p-1 text-red-400 hover:text-red-300" title="Delete">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {entriesWithBalance.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No entries yet. Add a bank charge or client receipt to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <BanknotesIcon className="h-16 w-16 text-gray-600" />
              <p className="mt-4">Select an account to view the cashbook</p>
            </div>
          )}
        </div>
      </div>

      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-granite-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingAccount ? 'Edit account' : 'Add account'}</h2>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <label className="block text-sm text-gray-400">
                Name *
                <input required value={accountForm.name} onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))} className={`${inputClass} mt-1`} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-gray-400">
                  Type
                  <select value={accountForm.type} onChange={(e) => setAccountForm((f) => ({ ...f, type: e.target.value }))} className={`${inputClass} mt-1`}>
                    {ACCOUNT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-gray-400">
                  Currency
                  <input value={accountForm.currency} onChange={(e) => setAccountForm((f) => ({ ...f, currency: e.target.value }))} className={`${inputClass} mt-1`} />
                </label>
              </div>
              <label className="block text-sm text-gray-400">
                Opening balance
                <input type="number" step="0.01" value={accountForm.openingBalance} onChange={(e) => setAccountForm((f) => ({ ...f, openingBalance: e.target.value }))} className={`${inputClass} mt-1`} />
              </label>
              <label className="block text-sm text-gray-400">
                Description
                <input value={accountForm.description} onChange={(e) => setAccountForm((f) => ({ ...f, description: e.target.value }))} className={`${inputClass} mt-1`} />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAccountModal(false)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEntryModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-lg border border-white/10 bg-granite-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editingEntry ? 'Edit entry' : 'Add entry'} – {selectedAccount.name}
              </h2>
              <button onClick={() => setShowEntryModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEntry} className="space-y-4">
              <label className="block text-sm text-gray-400">
                Purpose *
                <select
                  value={entryForm.purposeId}
                  onChange={(e) => applyPurpose(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  {PURPOSE_GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {PURPOSES.filter((item) => item.group === group).map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-gray-400">
                  Date *
                  <input
                    type="date"
                    required
                    value={entryForm.entryDate}
                    onChange={(e) => {
                      const date = e.target.value
                      setEntryForm((current) => ({
                        ...current,
                        entryDate: date,
                        description: selectedPurpose.amountOnly
                          ? selectedPurpose.description(date, selectedAccount.name)
                          : current.description,
                      }))
                    }}
                    className={`${inputClass} mt-1`}
                  />
                </label>
                <label className="block text-sm text-gray-400">
                  Amount *
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={entryForm.amount}
                    onChange={(e) => setEntryForm((f) => ({ ...f, amount: e.target.value }))}
                    className={`${inputClass} mt-1`}
                    placeholder="0.00"
                  />
                </label>
              </div>

              <p className={`text-xs ${isMoneyIn(selectedPurpose.storedType) ? 'text-green-400' : 'text-red-400'}`}>
                {entryTypeLabel(selectedPurpose.storedType)} · {isMoneyIn(selectedPurpose.storedType) ? 'money in' : 'money out'}
              </p>

              {(selectedPurpose.needsProject || entryForm.projectId) && (
                <label className="block text-sm text-gray-400">
                  Project {selectedPurpose.needsProject ? '' : '(optional)'}
                  <select
                    value={entryForm.projectId}
                    onChange={(e) => {
                      const projectId = e.target.value
                      setEntryForm((f) => ({ ...f, projectId, invoiceId: '' }))
                    }}
                    className={`${inputClass} mt-1`}
                  >
                    <option value="">No project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.projectCode ? `${project.projectCode} · ` : ''}{project.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedPurpose.linkInvoice && (
                <label className="block text-sm text-gray-400">
                  Link invoice or receipt
                  <select value={entryForm.invoiceId} onChange={(e) => handleInvoiceChange(e.target.value)} className={`${inputClass} mt-1`}>
                    <option value="">No invoice</option>
                    {invoiceOptions.map((invoice) => (
                      <option key={String(invoice.id)} value={String(invoice.id)}>
                        {invoice.document_type === 'receipt' ? 'Receipt' : 'Invoice'} · {invoice.invoice_number || invoice.id}
                        {invoice.client_name ? ` · ${invoice.client_name}` : ''}
                        {invoice.total_amount ? ` · ${formatCurrency(Number(invoice.document_type === 'receipt' ? invoice.total_amount : invoice.amount_due ?? invoice.total_amount), selectedAccount.currency)}` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-gray-500">
                    {selectedProject && invoicesForProject.length
                      ? `Showing ${invoicesForProject.filter((d) => d.document_type === 'invoice').length} invoice(s) and ${invoicesForProject.filter((d) => d.document_type === 'receipt').length} receipt(s) for this project.`
                      : selectedProject
                        ? 'No invoices or receipts are linked to this project yet. Showing all documents so you can still link one.'
                        : 'Select a project to filter invoices and receipts for that job.'}
                  </span>
                </label>
              )}

              {selectedPurpose.linkHosting && (
                <label className="block text-sm text-gray-400">
                  Link hosting expense
                  <select value={entryForm.hostingId} onChange={(e) => handleHostingChange(e.target.value)} className={`${inputClass} mt-1`}>
                    <option value="">No hosting record</option>
                    {hosting
                      .filter((item) => !entryForm.projectId || item.projectId === entryForm.projectId)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.provider || 'Hosting'} · {formatCurrency(Number(item.amount), selectedAccount.currency)}
                        </option>
                      ))}
                  </select>
                </label>
              )}

              {!selectedPurpose.amountOnly && (
                <label className="block text-sm text-gray-400">
                  Description
                  <input
                    value={entryForm.description}
                    onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))}
                    className={`${inputClass} mt-1`}
                  />
                </label>
              )}

              {selectedPurpose.amountOnly && (
                <p className="text-xs text-gray-500">{entryForm.description}</p>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEntryModal(false)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                  {submitting ? 'Saving…' : editingEntry ? 'Save changes' : 'Add entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-lg border border-white/10 bg-granite-800 p-6">
            <p className="text-white">Deactivate this account? Existing entries stay in the cashbook.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">Cancel</button>
              <button onClick={() => handleDeleteAccount(deleteConfirm)} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteEntryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-lg border border-white/10 bg-granite-800 p-6">
            <p className="text-white">Delete this cashbook entry? This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteEntryId(null)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">Cancel</button>
              <button onClick={() => handleDeleteEntry(deleteEntryId)} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
