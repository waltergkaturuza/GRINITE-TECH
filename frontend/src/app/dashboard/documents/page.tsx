'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DocumentManager from '@/components/DocumentManager'
import { canManageCompanyDocuments } from '@/lib/dashboardRoles'

export default function DocumentsPage() {
  const router = useRouter()

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      const user = raw ? JSON.parse(raw) : null
      if (!canManageCompanyDocuments(user?.role)) {
        router.replace('/dashboard')
      }
    } catch {
      router.replace('/dashboard')
    }
  }, [router])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="mt-1 text-sm text-gray-400">
          Company records library — certificates, bids, contracts, licenses, insurance, policies, and other
          files that are not tied to a single project. Project files still live on each project’s Files tab.
        </p>
      </div>
      <DocumentManager scope="company" tone="dark" />
    </div>
  )
}
