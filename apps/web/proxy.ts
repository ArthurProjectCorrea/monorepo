import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales, defaultLocale, hasLocale } from './app/[lang]/dictionaries'
import { AUTH_SESSION_COOKIE, hasAuthRoutePrefix, hasPrivateRoutePrefix } from './lib/auth-session'

function getLocale(request: NextRequest) {
  // 1. Check for saved preference in cookies (Priority)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && hasLocale(cookieLocale)) {
    return cookieLocale
  }

  // 2. Fallback to browser headers
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  return match(languages, locales, defaultLocale)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) {
    const locale = locales.find(
      currentLocale =>
        pathname.startsWith(`/${currentLocale}/`) || pathname === `/${currentLocale}`,
    )

    if (!locale) {
      return NextResponse.next()
    }

    const routePath = pathname.slice(locale.length + 1) || '/'
    const authSession = request.cookies.get(AUTH_SESSION_COOKIE)?.value

    if (hasPrivateRoutePrefix(routePath) && !authSession) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale}/sign-in`
      return NextResponse.redirect(redirectUrl)
    }

    if (hasAuthRoutePrefix(routePath) && authSession) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = `/${locale}/dashboard`
      return NextResponse.redirect(redirectUrl)
    }

    return NextResponse.next()
  }

  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, static, public files)
    '/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg).*)',
  ],
}
