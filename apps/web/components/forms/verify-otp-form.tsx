'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldContent } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { initialVerifyOtpState } from '@/lib/action/verify-otp-state'
import { resendRecoveryOtpAction, verifyRecoveryOtpAction } from '@/lib/action/verify-otp'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary, CommonNotificationDictionary } from '@/types/api'

interface VerifyOTPFormProps {
  dict: {
    title: string
    description: string
    submit_button: string
    loading_button: string
    resend_button: string
    back_to_login: string
    resend_success: string
  }
  notificationsDict: NotificationDictionary
  commonNotificationsDict: CommonNotificationDictionary
}

export function VerifyOTPForm({
  dict,
  notificationsDict,
  commonNotificationsDict,
}: VerifyOTPFormProps) {
  const [state, formAction, isPending] = React.useActionState(
    verifyRecoveryOtpAction,
    initialVerifyOtpState,
  )
  const [value, setValue] = React.useState('')
  const [countdown, setCountdown] = React.useState<number>(20)
  const [isResending, startResendTransition] = React.useTransition()
  const [resendStatus, setResendStatus] = React.useState<number | null>(null)
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
      commonDictionary: commonNotificationsDict,
      lang,
    })
  }, [lang, notificationsDict, commonNotificationsDict, state.httpStatus, state.notificationToken])

  React.useEffect(() => {
    if (!resendStatus) {
      return
    }

    if (resendStatus === 200) {
      toast.success(dict.resend_success)
    } else {
      notifyFromApi({
        httpStatus: resendStatus,
        dictionary: notificationsDict,
        commonDictionary: commonNotificationsDict,
        lang,
      })
    }
  }, [lang, notificationsDict, commonNotificationsDict, resendStatus, dict.resend_success])

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
        <input type="hidden" name="lang" value={lang} />
        <Field className="items-center p-2">
          <FieldContent>
            <InputOTP
              maxLength={6}
              value={value}
              onChange={value => setValue(value)}
              disabled={isPending}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="h-12 w-12 text-lg"
                  aria-invalid={!!state.fieldErrors?.otp_code}
                />
                <InputOTPSlot
                  index={1}
                  className="h-12 w-12 text-lg"
                  aria-invalid={!!state.fieldErrors?.otp_code}
                />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup>
                <InputOTPSlot
                  index={2}
                  className="h-12 w-12 text-lg"
                  aria-invalid={!!state.fieldErrors?.otp_code}
                />
                <InputOTPSlot
                  index={3}
                  className="h-12 w-12 text-lg"
                  aria-invalid={!!state.fieldErrors?.otp_code}
                />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup>
                <InputOTPSlot
                  index={4}
                  className="h-12 w-12 text-lg"
                  aria-invalid={!!state.fieldErrors?.otp_code}
                />
                <InputOTPSlot
                  index={5}
                  className="h-12 w-12 text-lg"
                  aria-invalid={!!state.fieldErrors?.otp_code}
                />
              </InputOTPGroup>
            </InputOTP>
          </FieldContent>
        </Field>

        <SubmitButton
          submitLabel={dict.submit_button}
          loadingLabel={dict.loading_button}
          canSubmit={value.length === 6}
          isRedirecting={isPending}
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
