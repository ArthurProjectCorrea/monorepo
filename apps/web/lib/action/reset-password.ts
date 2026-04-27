'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api, ApiRequestError } from '@/lib/api'
import { RECOVERY_IDENTIFIER_COOKIE, RECOVERY_RESET_TOKEN_COOKIE } from '@/lib/recovery-session'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'
import type { ResetPasswordActionState, ResetPasswordRequest, ResetPasswordResponse } from '@/types'

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function resetPasswordAction(
  _previousState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const cookieStore = await cookies()
  const identifier = cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value ?? ''
  const resetToken = cookieStore.get(RECOVERY_RESET_TOKEN_COOKIE)?.value ?? ''
  const newPassword = getStringField(formData, 'new_password')
  const confirmPassword = getStringField(formData, 'confirm_password')
  const lang = (getStringField(formData, 'lang') || 'pt') as Locale
  const dict = await getDictionary(lang)

  const fieldErrors: ResetPasswordActionState['fieldErrors'] = {}

  if (!identifier) {
    fieldErrors.identifier = dict.validation.invalid_credentials
  }

  if (!resetToken) {
    fieldErrors.reset_token = dict.validation.invalid_otp
  }

  if (!newPassword) {
    fieldErrors.new_password = dict.validation.required_password
  }

  if (!confirmPassword) {
    fieldErrors.confirm_password = dict.validation.required_password
  }

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    fieldErrors.confirm_password = dict.validation.passwords_dont_match
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
    const payload: ResetPasswordRequest = {
      identifier,
      reset_token: resetToken,
      new_password: newPassword,
    }

    await api.post<ResetPasswordResponse>('/v1/auth/reset-password', payload)
    cookieStore.delete(RECOVERY_RESET_TOKEN_COOKIE)
    cookieStore.delete(RECOVERY_IDENTIFIER_COOKIE)

    redirect(`/${lang}/sign-in?reset=true`)
  } catch (error) {
    // Re-throw Next.js redirect (it uses thrown exceptions internally)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

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
