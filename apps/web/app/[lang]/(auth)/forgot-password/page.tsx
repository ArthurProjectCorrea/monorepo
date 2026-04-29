import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang)

  return (
    <div className="w-full">
      <ForgotPasswordForm
        dict={dict.forgot_password}
        notificationsDict={dict.notifications.forgot_password}
        commonNotificationsDict={dict.common.notifications}
      />
    </div>
  )
}
