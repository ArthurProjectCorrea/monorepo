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
  access_token?: string
  token_type?: string
  expires_in: number
  refresh_token?: string
  refresh_expires_in?: number
  session_id: string
}

export interface UserTeamAccess {
  teamId: string
  profileId: string
}

export interface User {
  id: string
  name: string
  email: string
  is_active: boolean
  teams: UserTeamAccess[]
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  display_name: string
  roles: string[]
  permissions?: string[]
  mfa_enabled?: boolean
  client_id?: string
  domain?: string
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
  reset_token: string
}

export interface ResendRecoveryOtpResponse {
  status: 'resent'
  expires_in: number
}

export interface ResetPasswordResponse {
  status: 'success'
}

export interface ApiErrorPayload {
  error?: {
    code?: string
    message?: string
    details?: unknown
    request_id?: string
  }
}

export interface ActionState<T = unknown> {
  status: 'idle' | 'success' | 'error'
  httpStatus?: number
  notificationToken?: string
  data?: T
  fieldErrors?: Record<string, string | undefined>
}

export interface SignInActionState extends ActionState {
  fields?: {
    identifier?: string
    password?: string
  }
  nextStep?: 'authenticated'
  domain?: string
}

export interface ForgotPasswordActionState extends ActionState {
  nextStep?: 'otp_verification'
  identifier?: string
}

export interface VerifyOtpActionState extends ActionState {
  nextStep?: 'password_reset'
  identifier?: string
  resetToken?: string
}

export interface ResetPasswordActionState extends ActionState {
  nextStep?: 'signed_in'
}

export type GeneralActionState = ActionState
export type ScreenActionState = ActionState
export type TeamActionState = ActionState
export type UserActionState = ActionState
export type AccessProfileActionState = ActionState

export interface Screen {
  id: string
  screen_key: string
  title: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UpdateScreenRequest {
  name: string
  description: string
  is_active: boolean
}

export interface Team {
  id: string
  name: string
  icon?: string
  is_active: boolean
  updated_at: string
}

export interface PermissionAction {
  id: string
  name: string
}

export interface AccessProfilePermission {
  profileId: string
  screenId: string
  actionId: string
}

export interface AccessProfile {
  id: string
  name: string
  description?: string
  is_active: boolean
  permissions: AccessProfilePermission[]
  updated_at: string
}

export interface NotificationDictionary {
  success?: string
  success_create?: string
  success_update?: string
  success_delete?: string
  success_reset_password?: string
  success_resend_reset?: string
  error?: string
  info?: string
  warning?: string
  http_status?: Record<string, string>
}

export type CommonNotificationDictionary = NotificationDictionary

export type NotificationVariant = 'success' | 'info' | 'warning' | 'error'
