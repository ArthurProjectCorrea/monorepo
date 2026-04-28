'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'
import type { ClientActionState } from '@/types/api'

function getApiBaseUrl() {
  return (process.env.EXTERNAL_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
}

function resolveLogoUrl(logoUrl?: string | null): string | undefined {
  if (!logoUrl) return undefined
  if (logoUrl.startsWith('http')) return logoUrl
  return `${getApiBaseUrl()}${logoUrl}`
}

export async function getClientData(): Promise<{
  client: { name: string; domain: string; description?: string; logo_url?: string }
  screen?: { title: string; description: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const data = await api.get<{
      client: { name: string; domain: string; description?: string; logo_url?: string }
      screen?: { title: string; description: string }
    }>('/v1/clients/me', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      client: {
        ...data.client,
        logo_url: resolveLogoUrl(data.client.logo_url),
      },
      screen: data.screen,
    }
  } catch {
    return null
  }
}

export async function updateClientAction(
  _previousState: ClientActionState,
  formData: FormData,
): Promise<ClientActionState> {
  const lang = ((formData.get('lang') as string) || 'pt') as Locale
  const dict = await getDictionary(lang)

  const name = formData.get('name') as string
  const domain = formData.get('domain') as string
  const description = formData.get('description') as string

  const fieldErrors: ClientActionState['fieldErrors'] = {}

  if (!name) fieldErrors.name = dict.validation.required_name || 'Required'
  if (!domain) fieldErrors.domain = dict.validation.required_domain || 'Required'

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    // Send only JSON data to the updated API endpoint
    await api.put(
      '/v1/clients/me',
      {
        name,
        domain,
        description,
      },
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

    // Invalidate the cache for the entire domain to ensure UI reflects database changes
    revalidatePath('/', 'layout')

    return {
      status: 'success',
      httpStatus: 200,
      notificationToken: crypto.randomUUID(),
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return {
        status: 'error',
        httpStatus: error.status,
        notificationToken: crypto.randomUUID(),
      }
    }

    return {
      status: 'error',
      httpStatus: 500,
      notificationToken: crypto.randomUUID(),
    }
  }
}

export async function updateLogoAction(fileData: FormData): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.post<{ logo_url: string }>('/v1/clients/me/logo', fileData, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    // Invalidate the cache for the entire domain
    revalidatePath('/', 'layout')

    return resolveLogoUrl(response.logo_url) || null
  } catch (error) {
    console.error('Logo upload failed:', error)
    return null
  }
}
