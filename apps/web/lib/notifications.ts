'use client'

import { toast } from 'sonner'
import type { NotificationDictionary, NotificationVariant } from '@/types/api'

interface NotifyFromApiParams {
  httpStatus: number
  dictionary: NotificationDictionary
  lang?: string
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

function resolveMessage(httpStatus: number, dictionary: NotificationDictionary) {
  const key = String(httpStatus)
  if (dictionary.http_status[key]) {
    return dictionary.http_status[key]
  }

  const variant = getVariantFromHttpStatus(httpStatus)
  if (variant === 'success') {
    return dictionary.defaults.success
  }

  if (variant === 'warning') {
    return dictionary.defaults.warning
  }

  if (variant === 'error') {
    return dictionary.defaults.error
  }

  return dictionary.defaults.info
}

export function notifyFromApi({ httpStatus, dictionary, lang }: NotifyFromApiParams) {
  const activeLang = getActiveLanguage(lang)
  const message = resolveMessage(httpStatus, dictionary)
  const variant = getVariantFromHttpStatus(httpStatus)

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
