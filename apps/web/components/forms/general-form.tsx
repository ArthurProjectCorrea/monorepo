'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { InputUpload, type InputUploadDict, type UploadedFile } from '@/components/input-upload'
import { Spinner } from '@/components/ui/spinner'
import { notifyFromApi } from '@/lib/notifications'
import type { NotificationDictionary, CommonNotificationDictionary } from '@/types/api'
import * as React from 'react'
import { useActionState, useEffect, useState } from 'react'
import { saveClientAction, uploadLogoAction } from '@/lib/action/settings'
import { toast } from 'sonner'

// ─── Dict shape ───────────────────────────────────────────────────────────────

export interface GeneralFormDict {
  breadcrumb_settings: string
  media_title: string
  media_description: string
  info_title: string
  info_description: string
  name_label: string
  name_placeholder: string
  name_description: string
  description_label: string
  description_placeholder: string
  description_description: string
  domain_label: string
  domain_placeholder: string
  domain_description: string
  common: {
    actions: {
      discard: string
      save: string
      saving: string
    }
    notifications: CommonNotificationDictionary
  }
}

export interface GeneralFormProps {
  dict: GeneralFormDict
  dictUpload: InputUploadDict
  notificationsDict: NotificationDictionary
  lang: string
  initialData: {
    name: string
    domain: string
    description?: string
    logo_url?: string
  }
}

export function GeneralForm({
  dict,
  dictUpload,
  notificationsDict,
  lang,
  initialData,
}: GeneralFormProps) {
  const [state, action, isPending] = useActionState(saveClientAction, { status: 'idle' })

  // Track logo URL — updated when server returns a new one after save
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(initialData.logo_url)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  useEffect(() => {
    if (state.status !== 'idle' && state.notificationToken) {
      notifyFromApi({
        httpStatus: state.httpStatus || 500,
        dictionary: notificationsDict,
        commonDictionary: dict.common.notifications,
        lang,
      })
    }
  }, [
    state.status,
    state.notificationToken,
    state.httpStatus,
    notificationsDict,
    dict.common.notifications,
    lang,
  ])

  const handleLogoChange = async (uploadedFiles: UploadedFile[]) => {
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0].file
      const formData = new FormData()
      formData.append('logo', file)

      setIsUploadingLogo(true)
      try {
        const newLogoUrl = await uploadLogoAction(formData)
        if (newLogoUrl) {
          setCurrentLogoUrl(newLogoUrl)
          toast.success(dict.common.notifications.saved)
        } else {
          toast.error(dict.common.notifications.error)
        }
      } catch (err) {
        console.error(err)
        toast.error(dict.common.notifications.error)
      } finally {
        setIsUploadingLogo(false)
      }
    }
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-6">
      <form action={action}>
        <input type="hidden" name="lang" value={lang} />

        {/* ── Info card comes FIRST now ───────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{dict.info_title}</CardTitle>
            <CardDescription>{dict.info_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                {/* Name */}
                <Field data-invalid={!!state.fieldErrors?.name}>
                  <FieldLabel htmlFor="general-name">{dict.name_label}</FieldLabel>
                  <Input
                    id="general-name"
                    name="name"
                    defaultValue={initialData.name}
                    placeholder={dict.name_placeholder}
                    aria-invalid={!!state.fieldErrors?.name}
                  />
                  <FieldDescription>{dict.name_description}</FieldDescription>
                  {state.fieldErrors?.name && <FieldError>{state.fieldErrors.name}</FieldError>}
                </Field>

                {/* Domain */}
                <Field data-invalid={!!state.fieldErrors?.domain}>
                  <FieldLabel htmlFor="general-domain">{dict.domain_label}</FieldLabel>
                  <Input
                    id="general-domain"
                    name="domain"
                    defaultValue={initialData.domain}
                    placeholder={dict.domain_placeholder}
                    aria-invalid={!!state.fieldErrors?.domain}
                  />
                  <FieldDescription>{dict.domain_description}</FieldDescription>
                  {state.fieldErrors?.domain && <FieldError>{state.fieldErrors.domain}</FieldError>}
                </Field>

                {/* Description */}
                <Field data-invalid={!!state.fieldErrors?.description}>
                  <FieldLabel htmlFor="general-description">{dict.description_label}</FieldLabel>
                  <Textarea
                    id="general-description"
                    name="description"
                    defaultValue={initialData.description}
                    placeholder={dict.description_placeholder}
                    rows={4}
                    aria-invalid={!!state.fieldErrors?.description}
                  />
                  <FieldDescription>{dict.description_description}</FieldDescription>
                  {state.fieldErrors?.description && (
                    <FieldError>{state.fieldErrors.description}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" type="reset" disabled={isPending}>
                {dict.common.actions.discard}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    {dict.common.actions.saving}
                  </>
                ) : (
                  dict.common.actions.save
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* ── Media card comes SECOND ─────────────────────────────────── */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {dict.media_title}
            {isUploadingLogo && <Spinner className="size-4" />}
          </CardTitle>
          <CardDescription>{dict.media_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <InputUpload
            name="Logo"
            dict={dictUpload}
            accept="image/png, image/jpeg, image/webp"
            maxSize={4 * 1024 * 1024}
            maxFiles={1}
            initialUrl={currentLogoUrl}
            onChange={handleLogoChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}
