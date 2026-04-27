import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { SignInForm } from '@/components/forms/sign-in-form'

export default async function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang)

  return (
    <div className="w-full">
      <Suspense>
        <SignInForm
          dict={dict.sign_in}
          notificationsDict={dict.notifications.sign_in}
          resetNotificationsDict={dict.notifications.reset_password}
          signOutNotificationsDict={dict.notifications.sign_out}
        />
      </Suspense>
    </div>
  )
}
