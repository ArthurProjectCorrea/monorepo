'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import {
  RECOVERY_IDENTIFIER_COOKIE,
  RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
  RECOVERY_RESET_TOKEN_COOKIE,
} from '@/lib/recovery-session'
import type {
  ForgotPasswordActionState,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
} from '@/types/api'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function forgotPasswordAction(
  _previousState: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> {
  const identifier = getStringField(formData, 'identifier')
  const lang = (getStringField(formData, 'lang') || 'pt') as Locale
  const dict = await getDictionary(lang)

  if (!identifier) {
    return {
      status: 'error',
      fieldErrors: {
        identifier: dict.validation.required_email,
      },
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
    }
  }

  try {
    const payload: ForgotPasswordRequest = { identifier }
    await api.post<ForgotPasswordResponse>('/v1/auth/forgot-password', payload)

    const cookieStore = await cookies()
    cookieStore.set(RECOVERY_IDENTIFIER_COOKIE, identifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
      priority: 'high',
    })
    cookieStore.delete(RECOVERY_RESET_TOKEN_COOKIE)

    return {
      status: 'success',
      nextStep: 'otp_verification',
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
