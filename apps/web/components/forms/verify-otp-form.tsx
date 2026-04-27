'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldContent } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { initialVerifyOtpState } from '@/lib/action/verify-otp-state'
import { resendRecoveryOtpAction, verifyRecoveryOtpAction } from '@/lib/action/verify-otp'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary } from '@/types'

interface VerifyOTPFormProps {
  dict: {
    title: string
    description: string
    submit_button: string
    loading_button: string
    resend_button: string
    back_to_login: string
  }
  notificationsDict: NotificationDictionary
}

export function VerifyOTPForm({ dict, notificationsDict }: VerifyOTPFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    verifyRecoveryOtpAction,
    initialVerifyOtpState,
  )
  const [value, setValue] = React.useState('')
  const [countdown, setCountdown] = React.useState<number>(0)
  const [isResending, startResendTransition] = React.useTransition()
  const [resendStatus, setResendStatus] = React.useState<number | null>(null)
  const router = useRouter()
  const params = useParams()
  const lang = params.lang as string

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  React.useEffect(() => {
    if (!state.notificationToken || !state.httpStatus) {
      return
    }

    notifyFromApi({
      httpStatus: state.httpStatus,
      dictionary: notificationsDict,
      lang,
    })

    if (state.nextStep === 'password_reset') {
      router.push(`/${lang}/reset-password`)
    }
  }, [lang, notificationsDict, router, state.httpStatus, state.nextStep, state.notificationToken])

  React.useEffect(() => {
    if (!resendStatus) {
      return
    }

    notifyFromApi({
      httpStatus: resendStatus,
      dictionary: notificationsDict,
      lang,
    })
  }, [lang, notificationsDict, resendStatus])

  function handleResend() {
    if (countdown > 0 || isPending || isResending) return

    startResendTransition(async () => {
      const result = await resendRecoveryOtpAction()
      setResendStatus(result.httpStatus)
      if (result.httpStatus === 200) {
        setCountdown(20)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{dict.title}</h1>
        <p className="text-sm text-muted-foreground">{dict.description}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="otp_code" value={value} />
        <Field className="items-center p-2">
          <FieldContent>
            <InputOTP
              maxLength={6}
              value={value}
              onChange={value => setValue(value)}
              disabled={isPending}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup>
                <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup>
                <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
              </InputOTPGroup>
            </InputOTP>
          </FieldContent>
        </Field>

        {state.fieldErrors?.otp_code ? (
          <p className="text-xs text-destructive">{state.fieldErrors.otp_code}</p>
        ) : null}

        <SubmitButton
          submitLabel={dict.submit_button}
          loadingLabel={dict.loading_button}
          canSubmit={value.length === 6}
        />
      </form>

      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-full bg-transparent text-primary transition-all active:scale-[0.98]"
          onClick={handleResend}
          disabled={isPending || isResending || countdown > 0}
        >
          {countdown > 0 ? `${dict.resend_button} (${countdown}s)` : dict.resend_button}
        </Button>

        <Button variant="link" size="sm" className="mx-auto h-auto p-0 text-xs font-medium" asChild>
          <Link href={`/${lang}/sign-in`}>{dict.back_to_login}</Link>
        </Button>
      </div>
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
