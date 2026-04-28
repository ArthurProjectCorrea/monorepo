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

export async function proxy(request: NextRequest) {
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

    if (hasPrivateRoutePrefix(routePath)) {
      if (!authSession) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = `/${locale}/sign-in`
        return NextResponse.redirect(redirectUrl)
      }

      // Domain Validation: Check if the domain in the URL matches the user's client domain
      const segments = routePath.split('/').filter(Boolean)
      const urlDomain = segments[0]

      if (urlDomain) {
        try {
          const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL || 'http://localhost:5000'
          const sessionResponse = await fetch(`${apiBaseUrl}/v1/auth/session`, {
            headers: { Authorization: `Bearer ${authSession}` },
          })

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            const userDomain = sessionData.client?.domain

            if (userDomain && urlDomain !== userDomain) {
              // Redirect to the correct domain if mismatch
              const redirectUrl = request.nextUrl.clone()
              redirectUrl.pathname = `/${locale}/${userDomain}/dashboard`
              return NextResponse.redirect(redirectUrl)
            }
          } else if (sessionResponse.status === 401) {
            // Session expired or invalid
            const redirectUrl = request.nextUrl.clone()
            redirectUrl.pathname = `/${locale}/sign-in`
            return NextResponse.redirect(redirectUrl)
          }
        } catch (error) {
          console.error('Domain validation failed:', error)
        }
      }

      return NextResponse.next()
    }

    if (hasAuthRoutePrefix(routePath) && authSession) {
      const redirectUrl = request.nextUrl.clone()
      // We don't know the domain here yet, so we fetch session to find out where to redirect
      try {
        const apiBaseUrl = process.env.EXTERNAL_API_BASE_URL || 'http://localhost:5000'
        const sessionResponse = await fetch(`${apiBaseUrl}/v1/auth/session`, {
          headers: { Authorization: `Bearer ${authSession}` },
        })
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          const userDomain = sessionData.client?.domain || '1'
          redirectUrl.pathname = `/${locale}/${userDomain}/dashboard`
          return NextResponse.redirect(redirectUrl)
        }
      } catch {
        // Fallback if session fetch fails
        redirectUrl.pathname = `/${locale}/1/dashboard`
        return NextResponse.redirect(redirectUrl)
      }
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
