'use client'

import { toast } from 'sonner'
import { logToTerminal } from '@/lib/action/logger'
import type {
  NotificationDictionary,
  CommonNotificationDictionary,
  NotificationVariant,
} from '@/types/api'

interface NotifyFromApiParams {
  httpStatus: number
  dictionary?: NotificationDictionary
  commonDictionary: CommonNotificationDictionary
  lang?: string
  actionType?: 'create' | 'update' | 'delete'
}

function getActiveLanguage(lang?: string) {
  if (lang && lang.trim().length > 0) {
    return lang
  }

  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.lang
    if (htmlLang) {
      return htmlLang
    }
  }

  return 'en'
}

function getVariantFromHttpStatus(httpStatus: number): NotificationVariant {
  if (httpStatus >= 200 && httpStatus < 300) {
    return 'success'
  }

  if (httpStatus === 429) {
    return 'warning'
  }

  if (httpStatus >= 300 && httpStatus < 400) {
    return 'info'
  }

  if (httpStatus >= 400 && httpStatus < 500) {
    return 'error'
  }

  if (httpStatus >= 500) {
    return 'error'
  }

  return 'info'
}

function resolveMessage(
  httpStatus: number,
  dictionary: NotificationDictionary,
  commonDictionary: CommonNotificationDictionary,
  actionType?: 'create' | 'update' | 'delete',
) {
  const key = String(httpStatus)

  // 1. Try page-specific http_status
  if (dictionary.http_status?.[key]) {
    return dictionary.http_status[key]
  }

  // 2. Try common http_status
  if (commonDictionary.http_status?.[key]) {
    return commonDictionary.http_status[key]
  }

  const variant = getVariantFromHttpStatus(httpStatus)

  // 3. Try page-specific defaults
  if (variant === 'success' && dictionary.success) return dictionary.success
  if (variant === 'error' && dictionary.error) return dictionary.error

  // 4. Fallback to common defaults
  if (variant === 'success') {
    if (actionType === 'create' && commonDictionary.success_create)
      return commonDictionary.success_create
    if (actionType === 'update' && commonDictionary.success_update)
      return commonDictionary.success_update
    if (actionType === 'delete' && commonDictionary.success_delete)
      return commonDictionary.success_delete
    if (commonDictionary.success) return commonDictionary.success
  }
  if (variant === 'warning' && commonDictionary.warning) return commonDictionary.warning
  if (variant === 'error' && commonDictionary.error) return commonDictionary.error
  if (commonDictionary.info) return commonDictionary.info

  // Final fallback
  return `Operation completed (${httpStatus})`
}

export function notifyFromApi({
  httpStatus,
  dictionary,
  commonDictionary,
  lang,
  actionType,
}: NotifyFromApiParams) {
  const activeLang = getActiveLanguage(lang)
  const message = resolveMessage(
    httpStatus,
    dictionary || ({} as NotificationDictionary),
    commonDictionary,
    actionType,
  )
  const variant = getVariantFromHttpStatus(httpStatus)

  // Log to Terminal (Server Side) via Server Action
  const logType = variant === 'success' ? 'info' : variant === 'warning' ? 'warn' : 'error'
  logToTerminal(`HTTP ${httpStatus}: ${message}`, logType).catch(err =>
    console.error('Failed to log to terminal:', err),
  )

  if (variant === 'success') {
    toast.success(message, {
      id: `${activeLang}:${httpStatus}`,
    })
    return
  }

  if (variant === 'warning') {
    toast.warning(message, {
      id: `${activeLang}:${httpStatus}`,
    })
    return
  }

  if (variant === 'error') {
    toast.error(message, {
      id: `${activeLang}:${httpStatus}`,
    })
    return
  }

  toast.info(message, {
    id: `${activeLang}:${httpStatus}`,
  })
}
