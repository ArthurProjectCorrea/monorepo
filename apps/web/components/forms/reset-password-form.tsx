'use client'

import * as React from 'react'
import { ShieldCheck, Check, X } from 'lucide-react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import { InputPassword } from '@/components/input-password'
import { Spinner } from '@/components/ui/spinner'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { cn } from '@/lib/utils'
import { resetPasswordAction } from '@/lib/action/auth'
import { notifyFromApi } from '@/lib/notifications'
import type { Dictionary } from '@/types/i18n'

interface ResetPasswordFormProps {
  identifier: string
  resetToken: string
  dict: Dictionary['reset_password']
  common: Dictionary['common']
}

export function ResetPasswordForm({
  identifier,
  resetToken,
  dict,
  common,
}: ResetPasswordFormProps) {
  const [state, formAction, isPending] = React.useActionState(resetPasswordAction, {
    status: 'idle',
  })
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const lang = params.lang as string

  const formDict = dict.form
  const infoDict = formDict.cards.information

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
      dictionary: dict.notifications,
      commonDictionary: common.notifications,
      lang,
    })

    if (state.nextStep === 'signed_in') {
      router.push(`/${lang}/sign-in?reset=true`)
    }
  }, [
    lang,
    dict.notifications,
    common.notifications,
    state.httpStatus,
    state.notificationToken,
    state.nextStep,
    router,
  ])

  React.useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      // Show success message for OTP verification
      notifyFromApi({
        httpStatus: 200,
        dictionary: {
          success_reset_password: 'OTP verified successfully. Now you can reset your password.',
        }, // Fallback
        commonDictionary: common.notifications,
        lang,
      })
      window.history.replaceState({}, '', `/${lang}/reset-password`)
    }
  }, [lang, common.notifications, searchParams])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{infoDict.title}</h1>
        <p className="text-sm text-muted-foreground">{infoDict.description}</p>
      </div>

      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="lang" value={lang} />
        <input type="hidden" name="identifier" value={identifier} />
        <input type="hidden" name="resetToken" value={resetToken} />
        <Field>
          <FieldLabel htmlFor="email">
            <FieldTitle>{formDict.email.label}</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <Input id="email" value={identifier} disabled className="bg-muted/50" />
          </FieldContent>
        </Field>

        <Field data-invalid={!!state.fieldErrors?.new_password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">
              <FieldTitle>{formDict.password.label}</FieldTitle>
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
                    {formDict.security_rules.title}
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border',
                          rules.min_chars
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'border-muted-foreground/30 text-muted-foreground/30',
                        )}
                      >
                        {rules.min_chars ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={
                          rules.min_chars ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }
                      >
                        {formDict.security_rules.min_chars}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border',
                          rules.number
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'border-muted-foreground/30 text-muted-foreground/30',
                        )}
                      >
                        {rules.number ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={
                          rules.number ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }
                      >
                        {formDict.security_rules.number}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border',
                          rules.uppercase
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'border-muted-foreground/30 text-muted-foreground/30',
                        )}
                      >
                        {rules.uppercase ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={
                          rules.uppercase ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }
                      >
                        {formDict.security_rules.uppercase}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border',
                          rules.lowercase
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'border-muted-foreground/30 text-muted-foreground/30',
                        )}
                      >
                        {rules.lowercase ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={
                          rules.lowercase ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }
                      >
                        {formDict.security_rules.lowercase}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-xs">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-full border',
                          rules.special
                            ? 'bg-green-500/10 border-green-500/50 text-green-500'
                            : 'border-muted-foreground/30 text-muted-foreground/30',
                        )}
                      >
                        {rules.special ? (
                          <Check className="h-2.5 w-2.5" />
                        ) : (
                          <X className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <span
                        className={
                          rules.special ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }
                      >
                        {formDict.security_rules.special}
                      </span>
                    </li>
                  </ul>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <FieldContent>
            <InputPassword
              id="password"
              name="password"
              placeholder={formDict.password.placeholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.new_password}
              className="bg-background/50"
            />
          </FieldContent>
        </Field>

        <Field data-invalid={!!state.fieldErrors?.confirm_password}>
          <FieldLabel htmlFor="confirm_password">
            <FieldTitle>{formDict.confirm_password.label}</FieldTitle>
          </FieldLabel>
          <FieldContent>
            <InputPassword
              id="confirm_password"
              name="confirmPassword"
              placeholder={formDict.password.placeholder}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isPending}
              aria-invalid={!!state.fieldErrors?.confirm_password}
              className="bg-background/50"
            />
          </FieldContent>
        </Field>

        <SubmitButton
          submitLabel={formDict.submit.label}
          loadingLabel={formDict.submit.loading_text}
          canSubmit={allRulesMet && password === confirmPassword}
          isRedirecting={isPending}
        />
      </form>
    </div>
  )
}

function SubmitButton({
  submitLabel,
  loadingLabel,
  canSubmit,
  isRedirecting,
}: {
  submitLabel: string
  loadingLabel: string
  canSubmit: boolean
  isRedirecting: boolean
}) {
  const { pending } = useFormStatus()
  const isLoading = pending || isRedirecting

  return (
    <Button
      type="submit"
      disabled={isLoading || !canSubmit}
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
