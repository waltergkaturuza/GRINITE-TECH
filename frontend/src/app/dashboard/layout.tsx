'use client'

import { useState, useEffect, useMemo } from 'react'
import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { isStaffRole, isPathAllowedForStaff, canManageCompanyDocuments } from '@/lib/dashboardRoles'
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
  FolderIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const SIDEBAR_STORAGE_KEY = 'qt_sidebar_expanded'

type NavItem = {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const ALL_NAVIGATION: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: CubeIcon },
  { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon },
  { name: 'Project Tracking', href: '/dashboard/tracking', icon: ClockIcon },
  { name: 'Project Indicators', href: '/dashboard/indicators', icon: ChartBarIcon },
  { name: 'Clients', href: '/dashboard/clients', icon: UsersIcon },
  { name: 'Requests', href: '/dashboard/requests', icon: ClipboardDocumentListIcon },
  { name: 'Documents', href: '/dashboard/documents', icon: FolderIcon },
  { name: 'Products', href: '/dashboard/products', icon: ShoppingCartIcon },
  { name: 'News & Updates', href: '/dashboard/insights', icon: NewspaperIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Chat', href: '/dashboard/chat', icon: ChatBubbleLeftRightIcon },
  { name: 'Invoices', href: '/dashboard/invoices', icon: DocumentTextIcon },
  { name: 'Hosting Expenses', href: '/dashboard/hosting-expenses', icon: ServerStackIcon },
  { name: 'Accounts', href: '/dashboard/accounts', icon: BanknotesIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: CogIcon },
]

function itemIsActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopExpanded, setDesktopExpanded] = useState(false)
  const [hoverTip, setHoverTip] = useState<{ label: string; top: number } | null>(null)
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
    if (localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1') {
      setDesktopExpanded(true)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    if (isStaffRole(user.role)) {
      if (pathname === '/dashboard' || !isPathAllowedForStaff(pathname)) {
        router.replace('/dashboard/requests')
      }
      return
    }
    if (!canManageCompanyDocuments(user.role) && pathname.startsWith('/dashboard/documents')) {
      router.replace('/dashboard')
    }
  }, [user, pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const toggleDesktopSidebar = () => {
    setHoverTip(null)
    setDesktopExpanded((open) => {
      const next = !open
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? '1' : '0')
      return next
    })
  }

  const navigation = useMemo(() => {
    if (isStaffRole(user?.role)) {
      const staffHrefs = new Set([
        '/dashboard/requests',
        '/dashboard/products',
        '/dashboard/insights',
        '/dashboard/chat',
        '/dashboard/settings',
      ])
      return ALL_NAVIGATION.filter((item) => staffHrefs.has(item.href))
    }
    if (!canManageCompanyDocuments(user?.role)) {
      return ALL_NAVIGATION.filter((item) => item.href !== '/dashboard/documents')
    }
    return ALL_NAVIGATION
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-granite-800 via-jungle-900 to-crimson-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-900"></div>
      </div>
    )
  }

  const collapsed = !desktopExpanded
  const userLabel = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Account'

  const showTip = (label: string, event: { currentTarget: EventTarget & Element }) => {
    if (!collapsed) return
    const rect = event.currentTarget.getBoundingClientRect()
    setHoverTip({ label, top: rect.top + rect.height / 2 })
  }

  const hideTip = () => setHoverTip(null)

  return (
    <div className="min-h-screen bg-granite-900">
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
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                      itemIsActive(pathname, item.href)
                        ? 'bg-granite-700 text-white'
                        : 'text-gray-300 hover:bg-granite-700 hover:text-white'
                    }`}
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

      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-[width] duration-200 ${
          collapsed ? 'md:w-20' : 'md:w-64'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-granite-800 border-r border-granite-700 overflow-visible">
          <div
            className={`flex-shrink-0 px-2 pt-4 pb-2 ${
              collapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between gap-1'
            }`}
          >
            <h1
              className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-900 to-peach-900 ${
                collapsed ? 'text-lg' : 'px-2 text-xl'
              }`}
            >
              {collapsed ? 'QT' : 'QUANTIS TECHNOLOGIES'}
            </h1>
            <button
              type="button"
              onClick={toggleDesktopSidebar}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-300 hover:bg-granite-700 hover:text-white"
              aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
              title={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              {collapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
            </button>
          </div>
          <nav className={`mt-2 flex-1 space-y-1 overflow-y-auto px-2 ${collapsed ? 'pb-2' : ''}`}>
            {navigation.map((item) => {
              const active = itemIsActive(pathname, item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={(e) => showTip(item.name, e)}
                  onMouseLeave={hideTip}
                  className={`flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors duration-200 ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-granite-700 text-white'
                      : 'text-gray-300 hover:bg-granite-700 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-6 w-6 shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
          <div className={`flex-shrink-0 border-t border-granite-700 space-y-2 ${collapsed ? 'p-2' : 'p-4 space-y-3'}`}>
            <div
              className={`flex items-center ${collapsed ? 'justify-center' : 'w-full'}`}
              onMouseEnter={(e) => showTip(`${userLabel}${user?.email ? ` · ${user.email}` : ''}`, e)}
              onMouseLeave={hideTip}
            >
              <UserCircleIcon className="h-8 w-8 shrink-0 text-gray-400" />
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              )}
            </div>
            <Link
              href="/"
              onMouseEnter={(e) => showTip('Back to website', e)}
              onMouseLeave={hideTip}
              className={`flex items-center rounded-lg border border-granite-600 text-sm font-medium text-white hover:bg-granite-700 ${
                collapsed ? 'justify-center p-2' : 'w-full justify-center gap-2 px-3 py-2'
              }`}
            >
              <GlobeAltIcon className="h-5 w-5 shrink-0" />
              {!collapsed && 'Back to website'}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              onMouseEnter={(e) => showTip('Logout', e)}
              onMouseLeave={hideTip}
              className={`flex items-center rounded-lg bg-crimson-900 text-sm font-medium text-white hover:bg-crimson-800 ${
                collapsed ? 'w-full justify-center p-2' : 'w-full justify-center gap-2 px-3 py-2'
              }`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
              {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
        {collapsed && hoverTip && (
          <div
            className="pointer-events-none fixed z-[80] -translate-y-1/2 whitespace-nowrap rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white shadow-lg"
            style={{ left: 84, top: hoverTip.top }}
          >
            {hoverTip.label}
          </div>
        )}
      </div>

      <div className={`flex flex-col flex-1 transition-[padding] duration-200 ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
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

        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
