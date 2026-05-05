import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { RECOVERY_IDENTIFIER_COOKIE } from '@/lib/session-constants'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { VerifyOTPForm } from '@/components/forms/verify-otp-form'

import type { Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'

export default async function VerifyOTPPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ identifier?: string }>
}) {
  const { lang } = (await params) as { lang: Locale }
  const { identifier } = await searchParams

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = (await getDictionary(lang)) as Dictionary
  const cookieStore = await cookies()
  const recoveryIdentifier = identifier || cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value

  if (!recoveryIdentifier) {
    redirect(`/${lang}/forgot-password`)
  }

  return (
    <div className="w-full">
      <VerifyOTPForm identifier={recoveryIdentifier} dict={dict.verify_otp} common={dict.common} />
    </div>
  )
}
