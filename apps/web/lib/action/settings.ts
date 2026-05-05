'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/session-constants'
import type {
  GeneralActionState,
  UserActionState,
  TeamActionState,
  AccessProfileActionState,
  Screen,
  User,
  Team,
  AccessProfile,
} from '@/types/api'

// --- HELPERS ---

function getApiBaseUrl() {
  return (process.env.EXTERNAL_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '')
}

export async function resolveLogoUrl(logoUrl?: string | null): Promise<string | undefined> {
  if (!logoUrl) return undefined
  if (logoUrl.startsWith('http') || logoUrl.startsWith('data:')) return logoUrl
  return `${getApiBaseUrl()}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`
}

// --- GENERAL SETTINGS ---

export async function getGeneralSettingsData(): Promise<{
  data: {
    id: string
    name: string
    domain: string
    description: string
    is_active: boolean
    logo_url?: string
  }
  screen_general?: { id: string; title: string; description: string; key: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: {
        id: string
        name: string
        domain: string
        description: string
        is_active: boolean
        logo_url?: string
      }
      screen_general?: { id: string; title: string; description: string; key: string }
    }>('/v1/clients/me', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      data: {
        ...response.data,
        logo_url: await resolveLogoUrl(response.data.logo_url),
      },
      screen_general: response.screen_general,
    }
  } catch (error) {
    console.error('Failed to fetch general settings:', error)
    return null
  }
}

export async function saveGeneralSettingsAction(
  _previousState: GeneralActionState,
  formData: FormData,
): Promise<GeneralActionState> {
  const name = formData.get('name') as string
  const domain = formData.get('domain') as string
  const description = formData.get('description') as string
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'

  if (!name || !domain) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: {
        name: !name ? 'Required' : undefined,
        domain: !domain ? 'Required' : undefined,
      },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.put(
      '/v1/clients/me',
      { name, domain, description, is_active },
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

    revalidatePath('/', 'layout')
    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

export async function uploadLogoAction(fileData: FormData): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.post<{ logo_url: string }>('/v1/clients/me/logo', fileData, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    revalidatePath('/', 'layout')
    return (await resolveLogoUrl(response.logo_url)) || null
  } catch (error) {
    console.error('Logo upload failed:', error)
    return null
  }
}

// --- USERS ---

export async function getUsersData(): Promise<{
  data: User[]
  other?: { teams: Team[]; access_profiles: AccessProfile[] }
  screen_users?: { id: string; title: string; description: string; key: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: User[]
      other?: { teams: Team[]; access_profiles: AccessProfile[] }
      screen_users?: { id: string; title: string; description: string; key: string }
    }>('/v1/users', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      data: response.data,
      other: response.other,
      screen_users: response.screen_users,
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return null
  }
}

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

export async function saveUserAction(
  _previousState: UserActionState,
  formData: FormData,
): Promise<UserActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
  const accesses = JSON.parse((formData.get('accesses') as string) || '[]')

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
    const payload = { name, email, is_active, accesses }

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
    return { status: 'success', httpStatus: id ? 200 : 201, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

export async function deleteUserAction(id: string): Promise<UserActionState> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    await api.del(`/v1/users/${id}`, {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    revalidatePath('/[lang]/[domain]/settings/users', 'page')
    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

export async function resendResetPasswordAction(id: string): Promise<UserActionState> {
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

    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

// --- SCREENS ---

export async function fetchScreensData(): Promise<{ data: Screen[] } | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{ status: string; data: Screen[] }>('/v1/parameters/screens', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return { data: response.data }
  } catch (error) {
    console.error('Failed to fetch screens:', error)
    return null
  }
}

// --- ACCESS PROFILES ---

export async function getAccessProfilesData(): Promise<{
  data: AccessProfile[]
  other?: { actions: { id: string; name: string }[]; screens: Screen[] }
  screen_access_profiles?: { id: string; title: string; description: string; key: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: AccessProfile[]
      other?: { actions: { id: string; name: string }[]; screens: Screen[] }
      screen_access_profiles?: { id: string; title: string; description: string; key: string }
    }>('/v1/access-profiles', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      data: response.data,
      other: response.other,
      screen_access_profiles: response.screen_access_profiles,
    }
  } catch (error) {
    console.error('Failed to fetch access profiles:', error)
    return null
  }
}

export async function getAccessProfileByIdData(id: string): Promise<AccessProfile | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{ status: string; data: AccessProfile }>(
      `/v1/access-profiles/${id}`,
      {
        headers: { Authorization: `Bearer ${sessionId}` },
      },
    )

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
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'
  const accesses = JSON.parse((formData.get('accesses') as string) || '[]')

  if (!name) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: { name: 'Required' },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value
    const payload = { name, description, is_active, accesses }

    if (id) {
      await api.put(`/v1/access-profiles/${id}`, payload, {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
    } else {
      await api.post('/v1/access-profiles', payload, {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
    }

    revalidatePath('/[lang]/[domain]/settings/access-profiles', 'page')
    return { status: 'success', httpStatus: id ? 200 : 201, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
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
    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

// --- TEAMS ---

export async function getTeamsData(): Promise<{
  data: Team[]
  screen_teams?: { id: string; title: string; description: string; key: string }
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value

    const response = await api.get<{
      status: string
      data: Team[]
      screen_teams?: { id: string; title: string; description: string; key: string }
    }>('/v1/teams', {
      headers: { Authorization: `Bearer ${sessionId}` },
    })

    return {
      data: response.data,
      screen_teams: response.screen_teams,
    }
  } catch (error) {
    console.error('Failed to fetch teams:', error)
    return null
  }
}

export async function saveTeamAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const icon = formData.get('icon') as string
  const is_active = formData.get('is_active') === 'true' || formData.get('is_active') === 'on'

  if (!name) {
    return {
      status: 'error',
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
      fieldErrors: { name: 'Required' },
    }
  }

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value
    const payload = { name, icon, is_active }

    if (id) {
      await api.put(`/v1/teams/${id}`, payload, {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
    } else {
      await api.post('/v1/teams', payload, {
        headers: { Authorization: `Bearer ${sessionId}` },
      })
    }

    revalidatePath('/[lang]/[domain]/settings/teams', 'page')
    return { status: 'success', httpStatus: id ? 200 : 201, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
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
    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}
