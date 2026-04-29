'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import type { Screen, ScreenActionState } from '@/types/api'

export async function getScreensData(): Promise<{
  data: Screen[]
  screen?: { title: string; description: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      data: Screen[]
      screen?: { title: string; description: string }
    }>('/v1/parameters/screens', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return response
  } catch {
    return null
  }
}

export async function updateScreenAction(
  _previousState: ScreenActionState,
  formData: FormData,
): Promise<ScreenActionState> {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const isActiveValue = formData.get('isActive')
  const isActive = isActiveValue === 'true' || isActiveValue === 'on'

  if (!id || !title) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: {
        title: !title ? 'Required' : undefined,
      },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.put(
      `/v1/parameters/screens/${id}`,
      {
        title,
        description,
        isActive,
      },
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

    revalidatePath('/[lang]/[domain]/parameters/screens', 'page')

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
