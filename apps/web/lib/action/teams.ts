'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import type { Team, TeamActionState } from '@/types/api'

export async function getTeamsData(): Promise<{
  data: Team[]
  pageInfo?: { title: string; description: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: Team[]
      screen?: { title: string; description: string }
    }>('/v1/teams', {
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
    console.error('Failed to fetch teams:', error)
    return null
  }
}

export async function updateTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const icon = formData.get('icon') as string
  const statusValue = formData.get('status')
  const status = statusValue === 'true' || statusValue === 'on'

  if (!id || !name) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: {
        name: !name ? 'Required' : undefined,
      },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.put(
      `/v1/teams/${id}`,
      {
        name,
        icon,
        isActive: status,
      },
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

    revalidatePath('/[lang]/[domain]/settings/teams', 'page')

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

export async function deleteTeamAction(id: string): Promise<TeamActionState> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.del(`/v1/teams/${id}`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    revalidatePath('/[lang]/[domain]/settings/teams', 'page')

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

export async function createTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const name = formData.get('name') as string
  const icon = formData.get('icon') as string
  const statusValue = formData.get('status')
  const status = statusValue === 'true' || statusValue === 'on'

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

    await api.post(
      '/v1/teams',
      {
        name,
        icon,
        isActive: status,
      },
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

    revalidatePath('/[lang]/[domain]/settings/teams', 'page')

    return {
      status: 'success',
      httpStatus: 201,
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
