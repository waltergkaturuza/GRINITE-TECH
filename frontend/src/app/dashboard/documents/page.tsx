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
          Company records and project files in one library. Filter by company, all projects, or a single
          project. Each project’s Files tab still shows files for that project only.
        </p>
      </div>
      <DocumentManager library tone="dark" />
    </div>
  )
}
