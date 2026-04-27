'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'

export async function signOutAction(formData?: FormData) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    if (sessionToken) {
      // Call API to invalidate session in Redis
      await api.post('/v1/auth/sign-out', undefined, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })
    }
  } catch (error) {
    console.error('Error during sign out API call:', error)
  } finally {
    // Always clear the cookie regardless of API success/failure
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_SESSION_COOKIE)

    // Redirect to login page using locale from cookie
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
    const locale = cookieLocale || 'pt'
    redirect(`/${locale}/sign-in?logout=true`)
  }
}
