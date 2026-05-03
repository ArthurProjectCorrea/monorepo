'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { InputPassword } from '@/components/input-password'
import { Spinner } from '@/components/ui/spinner'
import { signInAction } from '@/lib/action/auth'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary, CommonNotificationDictionary } from '@/types/api'

interface SignInFormProps {
  dict: {
    title: string
    description: string
    email_label: string
    email_placeholder: string
    password_label: string
    password_placeholder: string
    forgot_password: string
    submit_button: string
    loading_button: string
  }
  notificationsDict: NotificationDictionary
  resetNotificationsDict: NotificationDictionary
  signOutNotificationsDict: NotificationDictionary
  commonNotificationsDict: CommonNotificationDictionary
}

export function SignInForm({
  dict,
  notificationsDict,
  resetNotificationsDict,
  signOutNotificationsDict,
  commonNotificationsDict,
}: SignInFormProps) {
  const [state, formAction, isPending] = React.useActionState(signInAction, { status: 'idle' })
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lang = params.lang as string

  React.useEffect(() => {
    if (!state.notificationToken || !state.httpStatus) {
      return
    }

    notifyFromApi({
      httpStatus: state.httpStatus,
      dictionary: notificationsDict,
      commonDictionary: commonNotificationsDict,
      lang,
    })

    if (state.nextStep === 'authenticated') {
      setIsRedirecting(true)
      const userDomain = state.domain || '1'
      router.push(`/${lang}/${userDomain}/dashboard`)
    }
  }, [
    lang,
    notificationsDict,
    commonNotificationsDict,
    router,
    state.domain,
    state.httpStatus,
    state.nextStep,
    state.notificationToken,
  ])

  React.useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      notifyFromApi({
        httpStatus: 200,
        dictionary: resetNotificationsDict,
        commonDictionary: commonNotificationsDict,
        lang,
      })

      // Clean up the URL to prevent showing the toast again on refresh
      window.history.replaceState({}, '', `/${lang}/sign-in`)
    } else if (searchParams.get('logout') === 'true') {
      notifyFromApi({
        httpStatus: 200,
        dictionary: signOutNotificationsDict,
        commonDictionary: commonNotificationsDict,
        lang,
      })
      window.history.replaceState({}, '', `/${lang}/sign-in`)
    }
  }, [
    lang,
    resetNotificationsDict,
    signOutNotificationsDict,
    commonNotificationsDict,
    searchParams,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {dict.title} {process.env.NEXT_PUBLIC_APP_NAME}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.description}</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="lang" value={lang} />

        <Field data-invalid={!!state.fieldErrors?.identifier}>
          <FieldLabel htmlFor="email">
            <FieldTitle>{dict.email_label}</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input
              id="email"
              name="identifier"
              placeholder={dict.email_placeholder}
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
              disabled={isPending}
              defaultValue={state.fields?.identifier}
              aria-invalid={!!state.fieldErrors?.identifier}
              className="bg-background/50"
            />
          </FieldContent>
        </Field>

        <Field data-invalid={!!state.fieldErrors?.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">
              <FieldTitle>{dict.password_label}</FieldTitle>
            </FieldLabel>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-medium" asChild>
              <Link href={`/${lang}/forgot-password`}>{dict.forgot_password}</Link>
            </Button>
          </div>
          <FieldContent>
            <InputPassword
              id="password"
              name="password"
              placeholder={dict.password_placeholder}
              autoCapitalize="none"
              autoComplete="current-password"
              required
              disabled={isPending}
              defaultValue={state.fields?.password}
              aria-invalid={!!state.fieldErrors?.password}
              className="bg-background/50"
            />
          </FieldContent>
        </Field>

        <SubmitButton
          submitLabel={dict.submit_button}
          loadingLabel={dict.loading_button}
          isRedirecting={isRedirecting}
        />
      </form>
    </div>
  )
}

function SubmitButton({
  submitLabel,
  loadingLabel,
  isRedirecting,
}: {
  submitLabel: string
  loadingLabel: string
  isRedirecting: boolean
}) {
  const { pending } = useFormStatus()
  const isLoading = pending || isRedirecting

  return (
    <Button
      type="submit"
      disabled={isLoading}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>{loadingLabel}</span>
        </div>
      ) : (
        submitLabel
      )}
    </Button>
  )
}
