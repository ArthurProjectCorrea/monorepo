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
  domain?: string
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
  success?: string
  error?: string
  http_status?: Record<string, string>
}

export interface CommonNotificationDictionary {
  success: string
  error: string
  info: string
  warning: string
  deleted: string
  saved: string
  http_status: Record<string, string>
}

export type NotificationVariant = 'success' | 'info' | 'warning' | 'error'

export interface ClientActionState {
  status: 'idle' | 'success' | 'error'
  fieldErrors?: {
    name?: string
    domain?: string
    description?: string
  }
  httpStatus?: number
  notificationToken?: string
  data?: {
    logo_url?: string
  }
}

export interface Screen {
  id: string
  screenKey: string
  title: string
  description: string
  isActive: boolean
  updatedAt: string
}

export interface ScreenFormDict {
  common: {
    actions: {
      discard: string
      save: string
      saving: string
      create: string
      cancel: string
      edit: string
      delete: string
      back: string
    }
    dialogs: {
      delete_confirm: {
        title: string
        description: string
        cancel: string
        confirm: string
      }
      edit_dialog: {
        title: string
        description: string
        cancel: string
        save: string
      }
    }
    notifications: CommonNotificationDictionary
    table: {
      status_active: string
      status_inactive: string
      column_status: string
      column_updated_at: string
      column_created_at: string
      no_results: string
    }
  }
  table: {
    column_key: string
    column_title: string
    column_description: string
    column_status: string
    column_updated_at: string
    form: {
      title_label: string
      title_placeholder: string
      title_description: string
      description_label: string
      description_placeholder: string
      description_description: string
      status_label: string
      status_description: string
    }
  }
  notifications: {
    success: string
    error: string
  }
}

export interface ScreenActionState {
  status: 'idle' | 'success' | 'error'
  httpStatus?: number
  notificationToken?: string
  fieldErrors?: {
    title?: string
    description?: string
  }
}

export interface Team {
  id: string
  name: string
  status: boolean
  updated_at: string
  icon?: string
}

export interface TeamFormDict {
  common: {
    actions: {
      discard: string
      save: string
      saving: string
      create: string
      cancel: string
      edit: string
      delete: string
      back: string
    }
    dialogs: {
      delete_confirm: {
        title: string
        description: string
        cancel: string
        confirm: string
      }
      edit_dialog: {
        title: string
        description: string
        cancel: string
        save: string
      }
    }
    notifications: CommonNotificationDictionary
    table: {
      status_active: string
      status_inactive: string
      column_status: string
      column_updated_at: string
      column_created_at: string
      no_results: string
    }
  }
  table: {
    column_icon: string
    column_name: string
    action_copy_key: string
    form: {
      title_label: string
      title_placeholder: string
      title_description: string
      icon_label: string
      icon_placeholder: string
      icon_description: string
      status_label: string
      status_description: string
    }
  }
  notifications: {
    success: string
    error: string
  }
}

export interface TeamActionState {
  status: 'idle' | 'success' | 'error'
  httpStatus?: number
  notificationToken?: string
  fieldErrors?: {
    name?: string
    description?: string
  }
}

export interface PermissionAction {
  id: string // e.g., 'view', 'create', 'update', 'delete'
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
  description: string
  isActive: boolean
  updatedAt: string
  permissions: AccessProfilePermission[]
}

export interface AccessProfileFormDict {
  common: {
    actions: {
      discard: string
      save: string
      saving: string
      create: string
      cancel: string
      edit: string
      delete: string
      back: string
    }
    dialogs: {
      delete_confirm: {
        title: string
        description: string
        cancel: string
        confirm: string
      }
    }
    notifications: CommonNotificationDictionary
    table: {
      status_active: string
      status_inactive: string
      column_status: string
      column_updated_at: string
      column_created_at: string
      no_results: string
    }
  }
  table: {
    column_name: string
    column_description: string
    form: {
      title_label: string
      title_placeholder: string
      title_description: string
      description_label: string
      description_placeholder: string
      description_description: string
      status_label: string
      status_description: string
      permissions_section_title: string
      permissions_section_description: string
      permission_view: string
      permission_create: string
      permission_update: string
      permission_delete: string
    }
  }
  notifications: {
    success: string
    error: string
  }
  screens_page: {
    table: {
      column_title: string
      form: {
        description_description: string
      }
    }
  }
  sidebar: {
    nav_main: {
      dashboard: string
      teams: string
      screens: string
      access_profiles: string
      parameters: string
    }
  }
}
