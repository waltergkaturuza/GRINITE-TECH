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
    <div className="flex min-h-[calc(100vh-5.5rem)] flex-col gap-6">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <p className="mt-1 text-sm text-gray-400">
          Upload files on one tab, then search and filter the library on the other. Each project’s Files tab
          still shows files for that project only.
        </p>
      </div>
      <div className="min-h-0 flex-1">
        <DocumentManager library tone="dark" />
      </div>
    </div>
  )
}
