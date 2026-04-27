'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import { RECOVERY_IDENTIFIER_COOKIE, RECOVERY_RESET_TOKEN_COOKIE } from '@/lib/recovery-session'
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

  const fieldErrors: ResetPasswordActionState['fieldErrors'] = {}

  if (!identifier) {
    fieldErrors.identifier = 'Identificador invalido. Refaca a recuperacao de senha.'
  }

  if (!resetToken) {
    fieldErrors.reset_token = 'Token de redefinicao invalido.'
  }

  if (!newPassword) {
    fieldErrors.new_password = 'Informe a nova senha.'
  }

  if (!confirmPassword) {
    fieldErrors.confirm_password = 'Confirme a nova senha.'
  }

  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    fieldErrors.confirm_password = 'As senhas nao conferem.'
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

    return {
      status: 'success',
      nextStep: 'signed_in',
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
