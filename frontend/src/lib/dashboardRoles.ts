/** Internal role: limited dashboard (requests, chat, products, settings). */
export function normalizeDashboardRole(role: string | undefined): string {
  return (role || '').toLowerCase().trim()
}

export function isStaffRole(role: string | undefined): boolean {
  return normalizeDashboardRole(role) === 'staff'
}

export const STAFF_ALLOWED_PATH_PREFIXES = [
  '/dashboard/requests',
  '/dashboard/products',
  '/dashboard/chat',
  '/dashboard/settings',
] as const

export function isPathAllowedForStaff(pathname: string): boolean {
  return STAFF_ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}
