'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { locales } from '@/app/[lang]/config'

interface LocaleSwitcherProps {
  dict: {
    label: string
  } & Record<string, string>
}

export function LocaleSwitcher({ dict }: LocaleSwitcherProps) {
  const pathname = usePathname()

  const segments = pathname.split('/')
  const currentLocale = segments[1]

  const switchLocale = (locale: string) => {
    if (locale === currentLocale) return

    // Save preference in cookie for proxy.ts to respect it
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`

    const newSegments = [...segments]
    newSegments[1] = locale
    const newPath = newSegments.join('/')

    // Use window.location.href for a full reload to avoid hydration/script issues
    // when switching between different locale layouts/dictionaries.
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = newPath
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{dict.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map(locale => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={currentLocale === locale ? 'bg-accent capitalize' : 'capitalize'}
          >
            {dict[locale] || locale}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
