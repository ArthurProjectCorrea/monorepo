import { redis } from '@/lib/redis'
import {
  AUTH_SESSION_COOKIE,
  RECOVERY_IDENTIFIER_COOKIE,
  RECOVERY_RESET_TOKEN_COOKIE,
  RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
  RECOVERY_RESET_TOKEN_MAX_AGE_SECONDS,
  PRIVATE_ROUTES,
  AUTH_ROUTES,
  STATIC_PREFIXES,
  SCREEN_PERMISSIONS,
} from './session-constants'

export {
  AUTH_SESSION_COOKIE,
  RECOVERY_IDENTIFIER_COOKIE,
  RECOVERY_RESET_TOKEN_COOKIE,
  RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
  RECOVERY_RESET_TOKEN_MAX_AGE_SECONDS,
  PRIVATE_ROUTES,
  AUTH_ROUTES,
  STATIC_PREFIXES,
  SCREEN_PERMISSIONS,
}

/* --- Types --- */
export interface Permission {
  screen_key: string
  actions: { key: string }[]
}

export interface UserMe {
  id: string
  name: string
  email: string
  accesses: {
    team_id: string
    access_profiles: {
      id: string
      name: string
      permissions: Permission[]
    }[]
  }[]
}

export interface SessionData {
  user_id: string
  email: string
  display_name: string
  client_id: string
  me: UserMe
}

/* --- Session & Permission Logic --- */

export async function getSessionData(sessionId: string): Promise<SessionData | null> {
  if (!sessionId) return null
  try {
    const data = await redis.get(`session:${sessionId}`)
    if (!data) return null
    return JSON.parse(data) as SessionData
  } catch (error) {
    console.error('Error getting session from Redis:', error)
    return null
  }
}

export async function hasPermission(
  sessionId: string,
  screenKey: string,
  actionKey: string = 'view',
): Promise<boolean> {
  const session = await getSessionData(sessionId)
  if (!session || !session.me) return false
  if (screenKey === 'dashboard') return true

  return session.me.accesses.some(access =>
    access.access_profiles.some(profile =>
      profile.permissions.some(
        p => p.screen_key === screenKey && p.actions.some(a => a.key === actionKey),
      ),
    ),
  )
}

export async function getScreenPermissions(sessionId: string, screenKey: string) {
  const session = await getSessionData(sessionId)
  const permissions = { view: false, create: false, update: false, delete: false }

  if (!session || !session.me) return permissions
  if (screenKey === 'dashboard') {
    permissions.view = true
    return permissions
  }

  session.me.accesses.forEach(access => {
    access.access_profiles.forEach(profile => {
      profile.permissions.forEach(p => {
        if (p.screen_key === screenKey) {
          p.actions.forEach(a => {
            if (a.key === 'view') permissions.view = true
            if (a.key === 'create') permissions.create = true
            if (a.key === 'update') permissions.update = true
            if (a.key === 'delete') permissions.delete = true
          })
        }
      })
    })
  })

  return permissions
}
