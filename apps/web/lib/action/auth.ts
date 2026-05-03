'use server'

import { cookies } from 'next/headers'
import { api, ApiRequestError } from '@/lib/api'
import { AUTH_SESSION_COOKIE } from '@/lib/auth-session'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'
import type {
  ActionState,
  SignInActionState,
  SignInRequest,
  SignInResponse,
  ForgotPasswordActionState,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpActionState,
  VerifyRecoveryOtpRequest,
  VerifyRecoveryOtpResponse,
  ResetPasswordActionState,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/types/api'

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Sign In Action
 */
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

  if (!identifier) fieldErrors.identifier = dict.validation.required_email
  if (!password) fieldErrors.password = dict.validation.required_password

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
    const payload: SignInRequest = { identifier, password }
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
      domain: response.user.domain,
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
    return { status: 'error', fields, httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

/**
 * Forgot Password Action
 */
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
      fieldErrors: { identifier: dict.validation.required_email },
      httpStatus: 400,
      notificationToken: crypto.randomUUID(),
    }
  }

  try {
    const payload: ForgotPasswordRequest = { identifier }
    await api.post<ForgotPasswordResponse>('/v1/auth/forgot-password', payload)

    return {
      status: 'success',
      nextStep: 'otp_verification',
      identifier,
      httpStatus: 202,
      notificationToken: crypto.randomUUID(),
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

/**
 * Verify OTP Action
 */
export async function verifyOtpAction(
  _previousState: VerifyOtpActionState,
  formData: FormData,
): Promise<VerifyOtpActionState> {
  const identifier = getStringField(formData, 'identifier')
  const otp_code = getStringField(formData, 'otp_code')
  const lang = (getStringField(formData, 'lang') || 'pt') as Locale
  const dict = await getDictionary(lang)

  const fieldErrors: VerifyOtpActionState['fieldErrors'] = {}
  if (!identifier) fieldErrors.identifier = dict.validation.required_email
  if (!otp_code) fieldErrors.otp_code = dict.validation.required_otp

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', fieldErrors, httpStatus: 400, notificationToken: crypto.randomUUID() }
  }

  try {
    const payload: VerifyRecoveryOtpRequest = { identifier, otp_code }
    const response = await api.post<VerifyRecoveryOtpResponse>(
      '/v1/auth/verify-recovery-otp',
      payload,
    )

    return {
      status: 'success',
      nextStep: 'password_reset',
      identifier,
      resetToken: response.reset_token,
      httpStatus: 200,
      notificationToken: crypto.randomUUID(),
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      if (error.status === 400) {
        return {
          status: 'error',
          fieldErrors: { otp_code: dict.validation.invalid_otp },
          httpStatus: 400,
          notificationToken: crypto.randomUUID(),
        }
      }
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

/**
 * Reset Password Action
 */
export async function resetPasswordAction(
  _previousState: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> {
  const identifier = getStringField(formData, 'identifier')
  const reset_token = getStringField(formData, 'resetToken')
  const new_password = getStringField(formData, 'password')
  const confirm_password = getStringField(formData, 'confirmPassword')
  const lang = (getStringField(formData, 'lang') || 'pt') as Locale
  const dict = await getDictionary(lang)

  const fieldErrors: ResetPasswordActionState['fieldErrors'] = {}

  if (!new_password) fieldErrors.new_password = dict.validation.required_password
  if (new_password !== confirm_password)
    fieldErrors.confirm_password = dict.validation.passwords_dont_match

  if (Object.keys(fieldErrors).length > 0) {
    return { status: 'error', fieldErrors, httpStatus: 400, notificationToken: crypto.randomUUID() }
  }

  try {
    const payload: ResetPasswordRequest = { identifier, reset_token, new_password }
    await api.post<ResetPasswordResponse>('/v1/auth/reset-password', payload)

    return {
      status: 'success',
      nextStep: 'signed_in',
      httpStatus: 200,
      notificationToken: crypto.randomUUID(),
    }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

/**
 * Resend Recovery OTP Action
 */
export async function resendRecoveryOtpAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identifier = getStringField(formData, 'identifier')

  try {
    await api.post('/v1/auth/resend-recovery-otp', { identifier })
    return { status: 'success', httpStatus: 200, notificationToken: crypto.randomUUID() }
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { status: 'error', httpStatus: error.status, notificationToken: crypto.randomUUID() }
    }
    return { status: 'error', httpStatus: 500, notificationToken: crypto.randomUUID() }
  }
}

/**
 * Sign Out Action
 */

export async function signOutAction() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_SESSION_COOKIE)
}
