import 'server-only'

const dictionaries = {
  en: () => import('../../dictionaries/en.json').then(module => module.default),
  pt: () => import('../../dictionaries/pt.json').then(module => module.default),
}

export type Locale = keyof typeof dictionaries

export const locales = Object.keys(dictionaries) as Locale[]
export const defaultLocale: Locale = 'en'

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
