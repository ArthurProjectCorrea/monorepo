'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import type { AccessProfile } from '@/types/api'

export interface AccessProfileActionState {
  status: 'idle' | 'success' | 'error'
  httpStatus?: number
  notificationToken?: string
  fieldErrors?: {
    name?: string
    description?: string
  }
}

export async function getAccessProfilesData(): Promise<{
  data: AccessProfile[]
  pageInfo?: { title: string; description: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: AccessProfile[]
      screen?: { title: string; description: string }
    }>('/v1/access-profiles', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      data: response.data,
      pageInfo: response.screen
        ? {
            title: response.screen.title,
            description: response.screen.description,
          }
        : undefined,
    }
  } catch (error) {
    console.error('Failed to fetch access profiles:', error)
    return null
  }
}

export async function getAccessProfileDetail(id: string): Promise<AccessProfile | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: AccessProfile
    }>(`/v1/access-profiles/${id}`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return response.data
  } catch (error) {
    console.error(`Failed to fetch access profile ${id}:`, error)
    return null
  }
}

export async function saveAccessProfileAction(
  _previousState: AccessProfileActionState,
  formData: FormData,
): Promise<AccessProfileActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const statusValue = formData.get('status')
  const status = statusValue === 'true' || statusValue === 'on'
  const permissionsRaw = formData.get('permissions') as string
  const permissions = permissionsRaw ? JSON.parse(permissionsRaw) : []

  if (!name) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: {
        name: 'Required',
      },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value
    const isUpdate = !!id

    if (isUpdate) {
      await api.put(
        `/v1/access-profiles/${id}`,
        {
          name,
          description,
          isActive: status,
          permissions,
        },
        {
          headers: { Authorization: `Bearer ${sessionId}` },
        },
      )
    } else {
      await api.post(
        '/v1/access-profiles',
        {
          name,
          description,
          isActive: status,
          permissions,
        },
        {
          headers: { Authorization: `Bearer ${sessionId}` },
        },
      )
    }

    revalidatePath('/[lang]/[domain]/settings/access-profiles', 'page')

    return {
      status: 'success',
      httpStatus: isUpdate ? 200 : 201,
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

export async function deleteAccessProfileAction(id: string): Promise<AccessProfileActionState> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.del(`/v1/access-profiles/${id}`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    revalidatePath('/[lang]/[domain]/settings/access-profiles', 'page')

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
