import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

import type { Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = (await params) as { lang: Locale }

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = (await getDictionary(lang)) as Dictionary

  return (
    <div className="w-full">
      <ForgotPasswordForm dict={dict.forgot_password} common={dict.common} />
    </div>
  )
}
