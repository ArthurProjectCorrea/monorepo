export const AUTH_SESSION_COOKIE = 'AUTH_SESSION'

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

export function hasPrivateRoutePrefix(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return false

  const firstSegment = `/${segments[0]}`

  // Check if it's a known static prefix
  if (STATIC_PREFIXES.includes(firstSegment)) return false

  // Check if it's an auth route
  if (AUTH_ROUTES.includes(firstSegment)) return false

  // If it has at least one segment and is not an auth route or static asset,
  // we treat it as a potential domain-based private route.
  return true
}

export function hasAuthRoutePrefix(pathname: string) {
  return AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}
