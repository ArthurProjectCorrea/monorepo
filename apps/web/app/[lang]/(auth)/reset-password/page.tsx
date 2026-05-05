import { getDictionary, hasLocale, Locale } from '@/app/[lang]/dictionaries'
import { RECOVERY_IDENTIFIER_COOKIE, RECOVERY_RESET_TOKEN_COOKIE } from '@/lib/session-constants'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'

import type { Dictionary } from '@/types/i18n'

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ identifier?: string; reset_token?: string }>
}) {
  const { lang } = (await params) as { lang: Locale }
  const { identifier: searchIdentifier, reset_token: searchResetToken } = await searchParams
  const cookieStore = await cookies()

  const identifier = (searchIdentifier || cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value) ?? ''
  const resetToken = (searchResetToken || cookieStore.get(RECOVERY_RESET_TOKEN_COOKIE)?.value) ?? ''

  if (!hasLocale(lang)) {
    notFound()
  }

  if (!identifier) {
    redirect(`/${lang}/forgot-password`)
  }

  if (!resetToken) {
    redirect(`/${lang}/verify-otp?identifier=${identifier}`)
  }

  const dict = (await getDictionary(lang)) as Dictionary

  return (
    <div className="w-full">
      <Suspense>
        <ResetPasswordForm
          identifier={identifier}
          resetToken={resetToken}
          dict={dict.reset_password}
          common={dict.common}
        />
      </Suspense>
    </div>
  )
}
