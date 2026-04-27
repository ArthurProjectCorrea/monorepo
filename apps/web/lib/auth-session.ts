export const AUTH_SESSION_COOKIE = 'AUTH_SESSION'

export const PRIVATE_ROUTES = ['/dashboard']

export const AUTH_ROUTES = ['/sign-in', '/forgot-password', '/reset-password', '/verify-otp']

export function hasPrivateRoutePrefix(pathname: string) {
  return PRIVATE_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export function hasAuthRoutePrefix(pathname: string) {
  return AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}
