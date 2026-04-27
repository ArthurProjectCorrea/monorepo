'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { InputPassword } from '@/components/input-password'
import { Spinner } from '@/components/ui/spinner'
import { signInAction } from '@/lib/action/sign-in'
import { initialSignInState } from '@/lib/action/sign-in-state'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary } from '@/types'
import system from '@/data/system.json'

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
}

export function SignInForm({ dict, notificationsDict }: SignInFormProps) {
  const [state, formAction, isPending] = React.useActionState(signInAction, initialSignInState)
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  React.useEffect(() => {
    if (!state.notificationToken || !state.httpStatus) {
      return
    }

    notifyFromApi({
      httpStatus: state.httpStatus,
      dictionary: notificationsDict,
      lang,
    })

    if (state.nextStep === 'authenticated') {
      router.push(`/${lang}/dashboard`)
    }
  }, [lang, notificationsDict, router, state.httpStatus, state.nextStep, state.notificationToken])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {dict.title} {system.name}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.description}</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <Field>
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
              className="bg-background/50"
            />
            {state.fieldErrors?.identifier ? (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.identifier}</p>
            ) : null}
          </FieldContent>
        </Field>

        <Field>
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
              className="bg-background/50"
            />
            {state.fieldErrors?.password ? (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.password}</p>
            ) : null}
          </FieldContent>
        </Field>

        <SubmitButton submitLabel={dict.submit_button} loadingLabel={dict.loading_button} />
      </form>
    </div>
  )
}

function SubmitButton({
  submitLabel,
  loadingLabel,
}: {
  submitLabel: string
  loadingLabel: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
    >
      {pending ? (
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
