'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Field, FieldContent } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { resendRecoveryOtpAction, verifyOtpAction } from '@/lib/action/auth'
import { notifyFromApi } from '@/lib/notifications'
import type { Dictionary } from '@/types/i18n'

interface VerifyOTPFormProps {
  identifier: string
  dict: Dictionary['verify_otp']
  common: Dictionary['common']
}

export function VerifyOTPForm({ identifier, dict, common }: VerifyOTPFormProps) {
  const [state, formAction, isPending] = React.useActionState(verifyOtpAction, { status: 'idle' })
  const [value, setValue] = React.useState('')
  const [countdown, setCountdown] = React.useState<number>(20)
  const [isResending, startResendTransition] = React.useTransition()
  const [resendStatus, setResendStatus] = React.useState<number | null>(null)
  const [isRedirecting, setIsRedirecting] = React.useState(false)
  const params = useParams()
  const router = useRouter()
  const lang = params.lang as string

  const formDict = dict.form
  const infoDict = formDict.cards.information

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
      dictionary: dict.notifications,
      commonDictionary: common.notifications,
      lang,
    })

    if (state.nextStep === 'password_reset') {
      setIsRedirecting(true)
      router.push(
        `/${lang}/reset-password?identifier=${identifier}&reset_token=${state.resetToken}`,
      )
    }
  }, [
    lang,
    dict.notifications,
    common.notifications,
    state.httpStatus,
    state.notificationToken,
    state.nextStep,
    state.resetToken,
    identifier,
    router,
  ])

  React.useEffect(() => {
    if (!resendStatus) {
      return
    }

    if (resendStatus === 200) {
      toast.success(dict.notifications.success_resend_otp)
    } else {
      notifyFromApi({
        httpStatus: resendStatus,
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        lang,
      })
    }
  }, [lang, dict.notifications, common.notifications, resendStatus])

  function handleResend() {
    if (countdown > 0 || isPending || isResending) return

    startResendTransition(async () => {
      const formData = new FormData()
      formData.append('identifier', identifier)
      const result = await resendRecoveryOtpAction({ status: 'idle' }, formData)
      setResendStatus(result.httpStatus || 500)
      if (result.httpStatus === 200) {
        setCountdown(20)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{infoDict.title}</h1>
        <p className="text-sm text-muted-foreground">{infoDict.description}</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="identifier" value={identifier} />
        <input type="hidden" name="otp_code" value={value} />
        <input type="hidden" name="lang" value={lang} />
        <Field className="items-center p-2">
          <FieldContent>
            <InputOTP
              maxLength={6}
              value={value}
              onChange={value => setValue(value)}
              disabled={isPending || isRedirecting}
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
          submitLabel={formDict.submit.label}
          loadingLabel={formDict.submit.loading_text}
          canSubmit={value.length === 6}
          isRedirecting={isPending || isRedirecting}
        />
      </form>

      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-full bg-transparent text-primary transition-all active:scale-[0.98]"
          onClick={handleResend}
          disabled={isPending || isResending || countdown > 0 || isRedirecting}
        >
          {countdown > 0 ? `${formDict.resend.label} (${countdown}s)` : formDict.resend.label}
        </Button>

        <Button variant="link" size="sm" className="mx-auto h-auto p-0 text-xs font-medium" asChild>
          <Link href={`/${lang}/sign-in`}>{formDict.back_to_login.label}</Link>
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
