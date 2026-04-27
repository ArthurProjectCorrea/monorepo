import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { RECOVERY_IDENTIFIER_COOKIE } from '@/lib/recovery-session'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { VerifyOTPForm } from '@/components/forms/verify-otp-form'

export default async function VerifyOTPPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang)
  const cookieStore = await cookies()
  const recoveryIdentifier = cookieStore.get(RECOVERY_IDENTIFIER_COOKIE)?.value

  if (!recoveryIdentifier) {
    redirect(`/${lang}/forgot-password`)
  }

  return (
    <div className="w-full">
      <VerifyOTPForm dict={dict.verify_otp} notificationsDict={dict.notifications.verify_otp} />
    </div>
  )
}
