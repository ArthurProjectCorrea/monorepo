'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { forgotPasswordAction } from '@/lib/action/forgot-password'
import { initialForgotPasswordState } from '@/lib/action/forgot-password-state'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary } from '@/types'

interface ForgotPasswordFormProps {
  dict: {
    title: string
    description: string
    email_label: string
    email_placeholder: string
    submit_button: string
    loading_button: string
    back_to_login: string
  }
  notificationsDict: NotificationDictionary
}

export function ForgotPasswordForm({ dict, notificationsDict }: ForgotPasswordFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    forgotPasswordAction,
    initialForgotPasswordState,
  )
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

    if (state.nextStep === 'otp_verification') {
      router.push(`/${lang}/verify-otp`)
    }
  }, [lang, notificationsDict, router, state.httpStatus, state.nextStep, state.notificationToken])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>
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

        <SubmitButton submitLabel={dict.submit_button} loadingLabel={dict.loading_button} />
      </form>

      <Button variant="link" size="sm" className="mx-auto h-auto p-0 text-xs font-medium" asChild>
        <Link href={`/${lang}/sign-in`}>{dict.back_to_login}</Link>
      </Button>
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
