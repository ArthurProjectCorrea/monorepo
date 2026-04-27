'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import {
  RECOVERY_IDENTIFIER_COOKIE,
  RECOVERY_IDENTIFIER_MAX_AGE_SECONDS,
  RECOVERY_RESET_TOKEN_COOKIE,
  RECOVERY_RESET_TOKEN_MAX_AGE_SECONDS,
} from '@/lib/recovery-session'
import type {
  ResendRecoveryOtpRequest,
  ResendRecoveryOtpResponse,
  VerifyOtpActionState,
  VerifyRecoveryOtpRequest,
  VerifyRecoveryOtpResponse,
} from '@/types'

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function verifyRecoveryOtpAction(
  _previousState: VerifyOtpActionState,
  formData: FormData,
): Promise<VerifyOtpActionState> {
  const otpCode = getStringField(formData, 'otp_code')
  const cookieStore = await cookies()
  const identifier = cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value ?? ''

  const fieldErrors: VerifyOtpActionState['fieldErrors'] = {}

  if (!identifier) {
    fieldErrors.identifier = 'Identificador invalido. Retorne para recuperar senha.'
  }

  if (!otpCode || otpCode.length !== 6) {
    fieldErrors.otp_code = 'Informe o codigo de 6 digitos.'
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

    return {
      status: 'success',
      nextStep: 'password_reset',
      identifier,
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
