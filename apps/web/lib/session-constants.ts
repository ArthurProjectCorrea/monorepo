/* --- Auth & Session Constants --- */
export const AUTH_SESSION_COOKIE = 'auth_access_token'
export const RECOVERY_IDENTIFIER_COOKIE = 'RECOVERY_IDENTIFIER'
export const RECOVERY_RESET_TOKEN_COOKIE = 'RECOVERY_RESET_TOKEN'

export const RECOVERY_IDENTIFIER_MAX_AGE_SECONDS = 15 * 60
export const RECOVERY_RESET_TOKEN_MAX_AGE_SECONDS = 10 * 60

export const PRIVATE_ROUTES = ['/dashboard']
export const AUTH_ROUTES = ['/sign-in', '/forgot-password', '/reset-password', '/verify-otp']
export const STATIC_PREFIXES = [
  '/avatars',
  '/images',
  '/fonts',
  '/favicon.ico',
  '/next.svg',
  '/vercel.svg',
]

export const SCREEN_PERMISSIONS = {
  general: ['view', 'update'],
  screen_parameters: ['view', 'update'],
  teams: ['view', 'create', 'update', 'delete'],
  access_profiles: ['view', 'create', 'update', 'delete'],
  users: ['view', 'create', 'update', 'delete'],
} as const

/* --- Route Helpers --- */
export function hasPrivateRoutePrefix(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return false
  const firstSegment = `/${segments[0]}`
  if (STATIC_PREFIXES.includes(firstSegment)) return false
  if (AUTH_ROUTES.includes(firstSegment)) return false
  return true
}

export function hasAuthRoutePrefix(pathname: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return AUTH_ROUTES.some(
    route => normalizedPath === route || normalizedPath.startsWith(`${route}/`),
  )
}
