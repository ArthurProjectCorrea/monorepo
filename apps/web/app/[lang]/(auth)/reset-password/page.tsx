import { getDictionary, hasLocale, Locale } from '@/app/[lang]/dictionaries'
import { RECOVERY_IDENTIFIER_COOKIE, RECOVERY_RESET_TOKEN_COOKIE } from '@/lib/recovery-session'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/forms/reset-password-form'

export default async function ResetPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const cookieStore = await cookies()
  const identifier = cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value ?? ''
  const resetToken = cookieStore.get(RECOVERY_RESET_TOKEN_COOKIE)?.value ?? ''

  if (!hasLocale(lang)) {
    notFound()
  }

  if (!identifier) {
    redirect(`/${lang}/forgot-password`)
  }

  if (!resetToken) {
    redirect(`/${lang}/verify-otp`)
  }

  const dict = await getDictionary(lang as Locale)

  return (
    <div className="w-full">
      <Suspense>
        <ResetPasswordForm
          identifier={identifier}
          dict={dict.reset_password}
          notificationsDict={dict.notifications.reset_password}
          verifyOtpNotificationsDict={dict.notifications.verify_otp}
          commonNotificationsDict={dict.common.notifications}
        />
      </Suspense>
    </div>
  )
}
