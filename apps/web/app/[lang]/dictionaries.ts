import 'server-only'
import { type Locale, locales } from '@/lib/utils'

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then(module => module.default),
}

// Fallback seguro para textos ausentes
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
    } else {
      if (target[key] === undefined) target[key] = source[key]
    }
  }
  return target
}

import type { Dictionary } from '@/types/i18n'

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const dict = await (dictionaries[locale] ? dictionaries[locale]() : dictionaries[defaultLocale]())
  // Carrega o dicionário padrão para fallback
  const defaultDict = await dictionaries[defaultLocale]()
  return deepMerge(
    dict as Record<string, unknown>,
    defaultDict as Record<string, unknown>,
  ) as unknown as Dictionary
}

export { type Locale, locales }
export const defaultLocale: Locale = 'en'

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale)
