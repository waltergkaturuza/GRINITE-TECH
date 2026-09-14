'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { isStaffRole, isPathAllowedForStaff } from '@/lib/dashboardRoles'
import { 
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  ClockIcon,
  ServerStackIcon,
  BanknotesIcon,
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/login')
      return
    }
    
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  useEffect(() => {
    if (!user) return
    if (!isStaffRole(user.role)) return
    if (pathname === '/dashboard' || !isPathAllowedForStaff(pathname)) {
      router.replace('/dashboard/requests')
    }
  }, [user, pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: true },
    { name: 'Projects', href: '/dashboard/projects', icon: CubeIcon, current: false },
    { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon, current: false },
    { name: 'Project Tracking', href: '/dashboard/tracking', icon: ClockIcon, current: false },
    { name: 'Project Indicators', href: '/dashboard/indicators', icon: ChartBarIcon, current: false },
    { name: 'Clients', href: '/dashboard/clients', icon: UsersIcon, current: false },
    { name: 'Requests', href: '/dashboard/requests', icon: ClipboardDocumentListIcon, current: false },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingCartIcon, current: false },
    { name: 'News & Updates', href: '/dashboard/insights', icon: NewspaperIcon, current: false },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, current: false },
    { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon, current: false },
    { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon, current: false },
    { name: 'Hosting Expenses', href: '/dashboard/hosting-expenses', icon: ServerStackIcon, current: false },
    { name: 'Accounts', href: '/dashboard/accounts', icon: BanknotesIcon, current: false },
    { name: 'Settings', href: '/dashboard/settings', icon: CogIcon, current: false },
  ]

  const navigation = useMemo(() => {
    if (!user || !isStaffRole(user.role)) return allNavigation
    const staffHrefs = new Set([
      '/dashboard/requests',
      '/dashboard/products',
      '/dashboard/insights',
      '/dashboard/chat',
      '/dashboard/settings',
    ])
    return allNavigation.filter((item) => staffHrefs.has(item.href))
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-800 via-jungle-900 to-crimson-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-granite-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-granite-800 border-r border-granite-700">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-900 to-peach-900">
                  QUANTIS TECHNOLOGIES
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-granite-700 hover:text-white transition-colors duration-200"
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 border-t border-granite-700 p-4 space-y-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-granite-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-granite-700"
              >
                <GlobeAltIcon className="h-5 w-5" />
                Back to website
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-crimson-800"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-granite-800 border-r border-granite-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-900 to-peach-900">
                QUANTIS TECHNOLOGIES
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-granite-700 hover:text-white transition-colors duration-200"
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 border-t border-granite-700 p-4 space-y-3">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-granite-600 px-3 py-2 text-sm font-medium text-white hover:bg-granite-700"
            >
              <GlobeAltIcon className="h-5 w-5" />
              Back to website
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-crimson-900 px-3 py-2 text-sm font-medium text-white hover:bg-crimson-800"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 md:hidden flex items-center justify-between gap-2 px-3 py-2 bg-granite-800 border-b border-granite-700">
          <button
            type="button"
            className="h-11 w-11 inline-flex items-center justify-center rounded-md text-gray-200 hover:text-white hover:bg-granite-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <p className="flex-1 min-w-0 text-sm font-semibold text-white truncate">Dashboard</p>
          <Link
            href="/"
            className="shrink-0 rounded-md px-2.5 py-2 text-xs font-semibold text-yellow-300 hover:bg-granite-700"
          >
            Website
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-md bg-crimson-900 px-3 py-2 text-xs font-semibold text-white hover:bg-crimson-800"
          >
            Logout
          </button>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}