'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { forgotPasswordAction } from '@/lib/action/auth'
import { notifyFromApi } from '@/lib/notifications'
import type { Dictionary } from '@/types/i18n'

interface ForgotPasswordFormProps {
  dict: Dictionary['forgot_password']
  common: Dictionary['common']
}

export function ForgotPasswordForm({ dict, common }: ForgotPasswordFormProps) {
  const [state, formAction, isPending] = React.useActionState(forgotPasswordAction, {
    status: 'idle',
  })
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  const formDict = dict.form
  const infoDict = formDict.cards.information

  React.useEffect(() => {
    if (!state.notificationToken || !state.httpStatus) {
      return
    }

    notifyFromApi({
      httpStatus: state.httpStatus,
      dictionary: dict.notifications,
      commonDictionary: common.notifications,
      lang,
    })

    if (state.nextStep === 'otp_verification') {
      setIsRedirecting(true)
      router.push(`/${lang}/verify-otp?identifier=${state.identifier}`)
    }
  }, [
    lang,
    dict.notifications,
    common.notifications,
    router,
    state.httpStatus,
    state.nextStep,
    state.notificationToken,
    state.identifier,
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{infoDict.title}</h1>
        <p className="text-sm text-muted-foreground">{infoDict.description}</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="lang" value={lang} />
        <Field data-invalid={!!state.fieldErrors?.identifier}>
          <FieldLabel htmlFor="email">
            <FieldTitle>{formDict.email.label}</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input
              id="email"
              name="identifier"
              placeholder={formDict.email.placeholder}
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.identifier}
              className="bg-background/50"
            />
          </FieldContent>
        </Field>

        <SubmitButton
          submitLabel={formDict.submit.label}
          loadingLabel={formDict.submit.loading_text}
          isRedirecting={isRedirecting}
        />
      </form>

      <Button variant="link" size="sm" className="mx-auto h-auto p-0 text-xs font-medium" asChild>
        <Link href={`/${lang}/sign-in`}>{formDict.back_to_login.label}</Link>
      </Button>
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
