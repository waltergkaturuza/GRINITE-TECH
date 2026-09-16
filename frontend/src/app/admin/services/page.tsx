'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminServicesRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/services')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-granite-900 text-white">
      Redirecting to Services...
    </div>
  )
}
