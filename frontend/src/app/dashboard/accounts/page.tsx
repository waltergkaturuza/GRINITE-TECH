'use client'

import { useState, useEffect } from 'react'
import {
  BanknotesIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import { ledgerAPI } from '@/lib/api'

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
}

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'petty_cash', label: 'Petty Cash' },
  { value: 'receivables', label: 'Receivables' },
  { value: 'payables', label: 'Payables' },
  { value: 'other', label: 'Other' },
]

export default function AccountsPage() {
  const [accountsWithBalances, setAccountsWithBalances] = useState<
    { account: LedgerAccount; balance: number }[]
  >([])
  const [selectedAccount, setSelectedAccount] = useState<LedgerAccount | null>(null)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<LedgerAccount | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'bank',
    currency: 'USD',
    openingBalance: '',
    description: '',
  })

  const [entryForm, setEntryForm] = useState({
    entryDate: new Date().toISOString().slice(0, 10),
    type: 'debit',
    amount: '',
    description: '',
  })

  useEffect(() => {
    loadAccounts()
  }, [])

  useEffect(() => {
    if (selectedAccount) loadEntries(selectedAccount.id)
  }, [selectedAccount])

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
      const res = await ledgerAPI.getEntries(accountId)
      setEntries(res.entries || [])
    } catch {
      setEntries([])
    }
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

  const openEditAccount = (a: LedgerAccount) => {
    setEditingAccount(a)
    setAccountForm({
      name: a.name,
      type: a.type || 'bank',
      currency: a.currency || 'USD',
      openingBalance: String(a.openingBalance ?? 0),
      description: a.description || '',
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
      if (editingAccount) {
        await ledgerAPI.updateAccount(editingAccount.id, payload)
      } else {
        await ledgerAPI.createAccount(payload)
      }
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
    setEntryForm({
      entryDate: new Date().toISOString().slice(0, 10),
      type: 'debit',
      amount: '',
      description: '',
    })
    setShowEntryModal(true)
  }

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAccount) return
    setSubmitting(true)
    try {
      await ledgerAPI.createEntry({
        accountId: selectedAccount.id,
        entryDate: entryForm.entryDate,
        type: entryForm.type,
        amount: parseFloat(entryForm.amount) || 0,
        description: entryForm.description || undefined,
        referenceType: 'manual',
      })
      setShowEntryModal(false)
      loadEntries(selectedAccount.id)
      loadAccounts()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save entry')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  const totalBalance = accountsWithBalances.reduce((sum, { balance }) => sum + balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounts</h1>
          <p className="mt-1 text-sm text-gray-400">
            Ledger accounts and balances
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

      {/* Summary */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-gray-400">Total balance (all accounts)</p>
        <p className={`text-2xl font-semibold ${totalBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(totalBalance)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Account list */}
        <div className="rounded-lg border border-white/10 bg-white/5">
          <h3 className="border-b border-white/10 px-4 py-3 text-sm font-medium text-gray-400">
            Accounts
          </h3>
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
                  className={`flex items-center justify-between px-4 py-3 ${
                    selectedAccount?.id === account.id ? 'bg-white/10' : 'hover:bg-white/5'
                  } cursor-pointer`}
                  onClick={() => setSelectedAccount(account)}
                >
                  <div>
                    <p className="font-medium text-white">{account.name}</p>
                    <p className="text-xs text-gray-500">{account.type}</p>
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
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteConfirm(account.id)
                      }}
                      className="rounded p-1 text-gray-400 hover:bg-red-900/30 hover:text-red-400"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected account entries */}
        <div className="lg:col-span-2 rounded-lg border border-white/10 bg-white/5">
          {selectedAccount ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div>
                  <h3 className="font-medium text-white">{selectedAccount.name}</h3>
                  <p className="text-sm text-gray-400">
                    Balance:{' '}
                    <span className={(accountsWithBalances.find((a) => a.account.id === selectedAccount.id)?.balance ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {formatCurrency(accountsWithBalances.find((a) => a.account.id === selectedAccount.id)?.balance ?? 0, selectedAccount.currency)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={openCreateEntry}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                >
                  Add entry
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-2 text-left text-xs text-gray-400">Date</th>
                      <th className="px-4 py-2 text-left text-xs text-gray-400">Type</th>
                      <th className="px-4 py-2 text-left text-xs text-gray-400">Description</th>
                      <th className="px-4 py-2 text-right text-xs text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-white/5">
                        <td className="px-4 py-2 text-sm text-gray-300">
                          {formatDate(entry.entryDate)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center gap-1 text-xs ${
                            entry.type === 'debit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {entry.type === 'debit' ? (
                              <ArrowTrendingDownIcon className="h-4 w-4" />
                            ) : (
                              <ArrowTrendingUpIcon className="h-4 w-4" />
                            )}
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-300">
                          {entry.description || '—'}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium">
                          <span className={entry.type === 'debit' ? 'text-green-400' : 'text-red-400'}>
                            {entry.type === 'debit' ? '+' : '-'}
                            {formatCurrency(Number(entry.amount), selectedAccount.currency)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {entries.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No entries yet. Add a manual entry to get started.
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
              <p className="mt-4">Select an account to view entries</p>
            </div>
          )}
        </div>
      </div>

      {/* Account modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-granite-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editingAccount ? 'Edit account' : 'Add account'}
              </h2>
              <button onClick={() => setShowAccountModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Name *</label>
                <input
                  type="text"
                  required
                  value={accountForm.name}
                  onChange={(e) => setAccountForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Type</label>
                  <select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  >
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Currency</label>
                  <input
                    type="text"
                    value={accountForm.currency}
                    onChange={(e) => setAccountForm((f) => ({ ...f, currency: e.target.value }))}
                    className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Opening balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.openingBalance}
                  onChange={(e) => setAccountForm((f) => ({ ...f, openingBalance: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <input
                  type="text"
                  value={accountForm.description}
                  onChange={(e) => setAccountForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAccountModal(false)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Entry modal */}
      {showEntryModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-granite-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add entry – {selectedAccount.name}</h2>
              <button onClick={() => setShowEntryModal(false)} className="text-gray-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Date *</label>
                <input
                  type="date"
                  required
                  value={entryForm.entryDate}
                  onChange={(e) => setEntryForm((f) => ({ ...f, entryDate: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Type</label>
                <select
                  value={entryForm.type}
                  onChange={(e) => setEntryForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                >
                  <option value="debit">Debit (money in)</option>
                  <option value="credit">Credit (money out)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={entryForm.amount}
                  onChange={(e) => setEntryForm((f) => ({ ...f, amount: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Description</label>
                <input
                  type="text"
                  value={entryForm.description}
                  onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowEntryModal(false)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Saving…' : 'Add entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="rounded-lg border border-white/10 bg-granite-800 p-6">
            <p className="text-white">Delete this account? Entries will be kept but the account will be deactivated.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">Cancel</button>
              <button onClick={() => handleDeleteAccount(deleteConfirm)} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
