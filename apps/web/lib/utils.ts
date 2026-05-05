import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Localization configuration
 */
export const defaultLocale = 'en' as const
export const locales = ['en'] as const
export type Locale = (typeof locales)[number]
