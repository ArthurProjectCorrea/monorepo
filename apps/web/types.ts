export interface DeviceContext {
  id?: string
  name?: string
  type?: string
  platform?: string
  ip?: string
  user_agent?: string
}

export interface SignInRequest {
  identifier: string
  password: string
  remember_me?: boolean
  device?: DeviceContext
}

export interface ForgotPasswordRequest {
  identifier: string
}

export interface VerifyRecoveryOtpRequest {
  identifier: string
  otp_code: string
}

export interface ResendRecoveryOtpRequest {
  identifier: string
}

export interface ResetPasswordRequest {
  identifier: string
  reset_token: string
  new_password: string
}

export interface AuthSession {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  refresh_expires_in?: number
  session_id: string
}

export interface AuthUser {
  id: string
  email: string
  display_name: string
  roles: string[]
  permissions?: string[]
  mfa_enabled?: boolean
}

export interface SignInResponse {
  status: 'authenticated'
  session: AuthSession
  user: AuthUser
}

export interface ForgotPasswordResponse {
  status: 'accepted'
  expires_in: number
}

export interface VerifyRecoveryOtpResponse {
  status: 'verified'
  reset_token: string
  reset_token_expires_in: number
}

export interface ResendRecoveryOtpResponse {
  status: 'resent'
  expires_in: number
}

export interface ResetPasswordResponse {
  status: 'password_updated'
}

export interface ApiErrorPayload {
  error?: {
    code?: string
    message?: string
    details?: unknown
    request_id?: string
  }
}

export interface SignInActionState {
  status: 'idle' | 'success' | 'error'
  fieldErrors?: {
    identifier?: string
    password?: string
  }
  fields?: {
    identifier?: string
    password?: string
  }
  nextStep?: 'authenticated'
  httpStatus?: number
  notificationToken?: string
}

export interface ForgotPasswordActionState {
  status: 'idle' | 'success' | 'error'
  fieldErrors?: {
    identifier?: string
  }
  nextStep?: 'otp_verification'
  identifier?: string
  httpStatus?: number
  notificationToken?: string
}

export interface VerifyOtpActionState {
  status: 'idle' | 'success' | 'error'
  fieldErrors?: {
    identifier?: string
    otp_code?: string
  }
  nextStep?: 'password_reset'
  identifier?: string
  resetToken?: string
  httpStatus?: number
  notificationToken?: string
}

export interface ResetPasswordActionState {
  status: 'idle' | 'success' | 'error'
  fieldErrors?: {
    identifier?: string
    reset_token?: string
    new_password?: string
    confirm_password?: string
  }
  nextStep?: 'signed_in'
  httpStatus?: number
  notificationToken?: string
}

export interface NotificationDictionary {
  defaults: {
    success: string
    info: string
    warning: string
    error: string
  }
  http_status: Record<string, string>
}

export type NotificationVariant = 'success' | 'info' | 'warning' | 'error'
