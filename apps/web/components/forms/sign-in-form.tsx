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
import type { Dictionary } from '@/types/i18n'

interface SignInFormProps {
  dict: Dictionary['sign_in']
  common: Dictionary['common']
}

export function SignInForm({ dict, common }: SignInFormProps) {
  const [state, formAction, isPending] = React.useActionState(signInAction, { status: 'idle' })
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
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

    if (state.nextStep === 'authenticated') {
      setIsRedirecting(true)
      const userDomain = state.domain || '1'
      router.push(`/${lang}/${userDomain}/dashboard`)
    }
  }, [
    lang,
    dict.notifications,
    common.notifications,
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
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        lang,
      })
      window.history.replaceState({}, '', `/${lang}/sign-in`)
    } else if (searchParams.get('logout') === 'true') {
      notifyFromApi({
        httpStatus: 200,
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        lang,
      })
      window.history.replaceState({}, '', `/${lang}/sign-in`)
    }
  }, [lang, common.notifications, searchParams])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {infoDict.title} {process.env.NEXT_PUBLIC_APP_NAME}
        </h1>
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
              defaultValue={state.fields?.identifier}
              aria-invalid={!!state.fieldErrors?.identifier}
              className="bg-background/50"
            />
          </FieldContent>
        </Field>

        <Field data-invalid={!!state.fieldErrors?.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">
              <FieldTitle>{formDict.password.label}</FieldTitle>
            </FieldLabel>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs font-medium" asChild>
              <Link href={`/${lang}/forgot-password`}>{formDict.forgot_password.label}</Link>
            </Button>
          </div>
          <FieldContent>
            <InputPassword
              id="password"
              name="password"
              placeholder={formDict.password.placeholder}
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
          submitLabel={formDict.submit.label}
          loadingLabel={formDict.submit.loading_text}
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
