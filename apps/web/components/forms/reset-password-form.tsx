'use client'

import * as React from 'react'
import { ShieldCheck, Check, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { InputPassword } from '@/components/input-password'
import { Spinner } from '@/components/ui/spinner'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { resetPasswordAction } from '@/lib/action/reset-password'
import { initialResetPasswordState } from '@/lib/action/reset-password-state'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary } from '@/types'

interface ResetPasswordFormProps {
  identifier: string
  dict: {
    title: string
    description: string
    email_label: string
    password_label: string
    confirm_password_label: string
    password_placeholder: string
    submit_button: string
    loading_button: string
    security_rules: {
      title: string
      min_chars: string
      number: string
      uppercase: string
      lowercase: string
      special: string
    }
  }
  notificationsDict: NotificationDictionary
}

export function ResetPasswordForm({ identifier, dict, notificationsDict }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    resetPasswordAction,
    initialResetPasswordState,
  )
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  const rules = {
    min_chars: password.length >= 8,
    number: /[0-9]/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  const allRulesMet = Object.values(rules).every(Boolean)

  React.useEffect(() => {
    if (!state.notificationToken || !state.httpStatus) {
      return
    }

    notifyFromApi({
      httpStatus: state.httpStatus,
      dictionary: notificationsDict,
      lang,
    })

    if (state.nextStep === 'signed_in') {
      router.push(`/${lang}/sign-in`)
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
            <Input id="email" value={identifier} disabled className="bg-muted/50" />
          </FieldContent>
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">
              <FieldTitle>{dict.password_label}</FieldTitle>
            </FieldLabel>

            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 cursor-help',
                    allRulesMet
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                align="end"
                className="w-80 backdrop-blur-md bg-background/95 p-4 rounded-xl shadow-2xl border-primary/10"
              >
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck
                      className={cn('h-4 w-4', allRulesMet ? 'text-green-500' : 'text-primary')}
                    />
                    {dict.security_rules.title}
                  </h4>
                  <ul className="space-y-2">
                    {Object.entries(rules).map(([key, met]) => (
                      <li key={key} className="flex items-center gap-2 text-xs">
                        <div
                          className={cn(
                            'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
                            met
                              ? 'bg-green-500/10 border-green-500/50 text-green-500'
                              : 'border-muted-foreground/30 text-muted-foreground/30',
                          )}
                        >
                          {met ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                        </div>
                        <span
                          className={met ? 'text-foreground font-medium' : 'text-muted-foreground'}
                        >
                          {dict.security_rules[key as keyof typeof rules]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <FieldContent>
            <InputPassword
              id="password"
              name="new_password"
              placeholder={dict.password_placeholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isPending}
              className="bg-background/50"
            />
            {state.fieldErrors?.new_password ? (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.new_password}</p>
            ) : null}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm_password">
            <FieldTitle>{dict.confirm_password_label}</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <InputPassword
              id="confirm_password"
              name="confirm_password"
              placeholder={dict.password_placeholder}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isPending}
              className="bg-background/50"
            />
            {state.fieldErrors?.confirm_password ? (
              <p className="mt-1 text-xs text-destructive">{state.fieldErrors.confirm_password}</p>
            ) : null}
          </FieldContent>
        </Field>

        <SubmitButton
          submitLabel={dict.submit_button}
          loadingLabel={dict.loading_button}
          canSubmit={allRulesMet && password === confirmPassword}
        />
      </form>
    </div>
  )
}

function SubmitButton({
  submitLabel,
  loadingLabel,
  canSubmit,
}: {
  submitLabel: string
  loadingLabel: string
  canSubmit: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || !canSubmit}
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
