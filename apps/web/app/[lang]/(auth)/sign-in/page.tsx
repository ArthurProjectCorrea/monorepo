import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SignInForm } from '@/components/forms/sign-in-form'

import type { Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'

export default async function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: Locale }

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = (await getDictionary(lang)) as Dictionary

  return (
    <div className="w-full">
      <Suspense>
        <SignInForm dict={dict.sign_in} common={dict.common} />
      </Suspense>
    </div>
  )
}
