'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import type { User, UserActionState } from '@/types/api'

/**
 * Fetch users list
 */
export async function getUsersData(): Promise<{
  data: User[]
  pageInfo?: { title: string; description: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: User[]
      screen?: { title: string; description: string }
    }>('/v1/users', {
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
    console.error('Failed to fetch users:', error)
    return null
  }
}

/**
 * Fetch user by ID
 */
export async function getUserByIdData(id: string): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{ status: string; data: User }>(`/v1/users/${id}`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return response.data
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error)
    return null
  }
}

/**
 * Save User (Create or Update)
 */
export async function saveUserAction(
  _prevState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const statusValue = formData.get('isActive')
  const isActive = statusValue === 'true' || statusValue === 'on'
  const teams = JSON.parse((formData.get('teams') as string) || '[]')

  if (!name || !email) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: {
        name: !name ? 'Required' : undefined,
        email: !email ? 'Required' : undefined,
      },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const payload = { name, email, isActive, teams }

    if (id) {
      await api.put(`/v1/users/${id}`, payload, {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
    } else {
      await api.post('/v1/users', payload, {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
    }

    revalidatePath('/[lang]/[domain]/settings/users', 'page')

    return {
      status: 'success',
      httpStatus: id ? 200 : 201,
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

/**
 * Delete User
 */
export async function deleteUserAction(id: string): Promise<UserActionState> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.del(`/v1/users/${id}`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    revalidatePath('/[lang]/[domain]/settings/users', 'page')

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

/**
 * Resend Reset Link
 */
export async function resendResetAction(id: string): Promise<UserActionState> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.post(
      `/v1/users/${id}/resend-reset`,
      {},
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

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
