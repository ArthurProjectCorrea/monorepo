'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/session-constants'
import type { Screen, ScreenActionState } from '@/types/api'

/**
 * Fetch screen parameters data
 */
export async function getScreenParametersData(): Promise<{
  data: Screen[]
  screen_screen_parameters?: { id: string; title: string; description: string; key: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: Screen[]
      screen_screen_parameters?: { id: string; title: string; description: string; key: string }
    }>('/v1/parameters/screens', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      data: response.data,
      screen_screen_parameters: response.screen_screen_parameters,
    }
  } catch (error) {
    console.error('Failed to fetch screen parameters:', error)
    return null
  }
}

/**
 * Update Screen Parameter Action
 */
export async function updateScreenParameterAction(
  _previousState: ScreenActionState,
  formData: FormData,
): Promise<ScreenActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'

  if (!id || !name) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.put(
      `/v1/parameters/screens/${id}`,
      { name, description, is_active },
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

    revalidatePath('/[lang]/[domain]/parameters/screens', 'page')
    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}
