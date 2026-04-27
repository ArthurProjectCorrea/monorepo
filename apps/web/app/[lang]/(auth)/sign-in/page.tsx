import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { SignInForm } from '@/components/forms/sign-in-form'

export default async function SignInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang)

  return (
    <div className="w-full">
      <SignInForm dict={dict.sign_in} notificationsDict={dict.notifications.sign_in} />
    </div>
  )
}
