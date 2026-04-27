'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import type { SignInActionState, SignInRequest, SignInResponse } from '@/types'

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function signInAction(
  _previousState: SignInActionState,
  formData: FormData,
): Promise<SignInActionState> {
  const identifier = getStringField(formData, 'identifier')
  const password = getStringField(formData, 'password')

  const fieldErrors: SignInActionState['fieldErrors'] = {}

  if (!identifier) {
    fieldErrors.identifier = 'Informe o e-mail.'
  }

  if (!password) {
    fieldErrors.password = 'Informe a senha.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
    }
  }

  try {
    const payload: SignInRequest = {
      identifier,
      password,
    }

    const response = await api.post<SignInResponse>('/v1/auth/sign-in', payload)

    const cookieStore = await cookies()
    cookieStore.set(AUTH_SESSION_COOKIE, response.session.session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: response.session.expires_in,
      priority: 'high',
    })

    return {
      status: 'success',
      nextStep: 'authenticated',
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
