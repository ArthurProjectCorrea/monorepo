import 'server-only'
import { type Locale, locales } from './config'

const dictionaries = {
  es: () => import('../../dictionaries/es.json').then(module => module.default),
  en: () => import('../../dictionaries/en.json').then(module => module.default),
  pt: () => import('../../dictionaries/pt.json').then(module => module.default),
}

export { type Locale, locales }
export const defaultLocale: Locale = 'en'

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale)

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
