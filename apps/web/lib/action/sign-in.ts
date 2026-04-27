'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'
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
  const lang = (getStringField(formData, 'lang') || 'pt') as Locale
  const dict = await getDictionary(lang)
  const fields = { identifier, password }

  const fieldErrors: SignInActionState['fieldErrors'] = {}

  if (!identifier) {
    fieldErrors.identifier = dict.validation.required_email
  }

  if (!password) {
    fieldErrors.password = dict.validation.required_password
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fields,
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
      if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) {
        fieldErrors.identifier = dict.validation.invalid_credentials
        fieldErrors.password = dict.validation.invalid_credentials

        return {
          status: 'error',
          fields,
          fieldErrors,
          httpStatus: error.status,
          notificationToken: crypto.randomUUID(),
        }
      }

      return {
        status: 'error',
        fields,
        httpStatus: error.status,
        notificationToken: crypto.randomUUID(),
      }
    }

    return {
      status: 'error',
      fields,
      httpStatus: 500,
      notificationToken: crypto.randomUUID(),
    }
  }
}
