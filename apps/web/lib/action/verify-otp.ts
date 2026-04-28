'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api, ApiRequestError } from '@/lib/api'
import {
  RECOVERY_IDENTIFIER_COOKIE,
  RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
  RECOVERY_RESET_TOKEN_COOKIE,
  RECOVERY_RESET_TOKEN_MAX_AGE_SECONDS,
} from '@/lib/recovery-session'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'
import type {
  ResendRecoveryOtpRequest,
  ResendRecoveryOtpResponse,
  VerifyOtpActionState,
  VerifyRecoveryOtpRequest,
  VerifyRecoveryOtpResponse,
} from '@/types/api'

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function verifyRecoveryOtpAction(
  _previousState: VerifyOtpActionState,
  formData: FormData,
): Promise<VerifyOtpActionState> {
  const otpCode = getStringField(formData, 'otp_code')
  const lang = (getStringField(formData, 'lang') || 'pt') as Locale
  const dict = await getDictionary(lang)

  const cookieStore = await cookies()
  const identifier = cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value ?? ''

  const fieldErrors: VerifyOtpActionState['fieldErrors'] = {}

  if (!identifier) {
    fieldErrors.identifier = dict.validation.invalid_credentials // Re-using general error or could be specific
  }

  if (!otpCode || otpCode.length !== 6) {
    fieldErrors.otp_code = dict.validation.required_otp
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
    const payload: VerifyRecoveryOtpRequest = {
      identifier,
      otp_code: otpCode,
    }

    const response = await api.post<VerifyRecoveryOtpResponse>('/v1/auth/verify-otp', payload)
    cookieStore.set(RECOVERY_RESET_TOKEN_COOKIE, response.reset_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: Math.min(response.reset_token_expires_in, RECOVERY_RESET_TOKEN_MAX_AGE_SECONDS),
      priority: 'high',
    })
    cookieStore.set(RECOVERY_IDENTIFIER_COOKIE, identifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
      priority: 'high',
    })

    redirect(`/${lang}/reset-password?verified=true`)
  } catch (error) {
    // Re-throw Next.js redirect (it uses thrown exceptions internally)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    if (error instanceof ApiRequestError) {
      if (error.code === 'INVALID_OTP' || error.status === 400 || error.status === 401) {
        fieldErrors.otp_code = dict.validation.invalid_otp
        return {
          status: 'error',
          fieldErrors,
          httpStatus: error.status,
          notificationToken: crypto.randomUUID(),
        }
      }

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

export async function resendRecoveryOtpAction(): Promise<{ httpStatus: number }> {
  const cookieStore = await cookies()
  const identifier = cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value ?? ''

  if (!identifier) {
    return { httpStatus: 400 }
  }

  try {
    const payload: ResendRecoveryOtpRequest = { identifier }
    await api.post<ResendRecoveryOtpResponse>('/v1/auth/resend-otp', payload)
    return { httpStatus: 200 }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { httpStatus: error.status }
    }

    return { httpStatus: 500 }
  }
}
