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
import type { Dictionary } from '@/types/i18n'
import * as React from 'react'
import { useActionState, useEffect, useState } from 'react'
import { saveGeneralSettingsAction, uploadLogoAction } from '@/lib/action/settings'
import { toast } from 'sonner'

export interface GeneralFormProps {
  dict: Dictionary['general']
  common: Dictionary['common']
  dictUpload: InputUploadDict
  lang: string
  initialData: {
    name: string
    domain: string
    description?: string
    logo_url?: string
  }
  permissions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
}

export function GeneralForm({
  dict,
  common,
  dictUpload,
  lang,
  initialData,
  permissions,
}: GeneralFormProps) {
  const [state, action, isPending] = useActionState(saveGeneralSettingsAction, { status: 'idle' })

  // Track logo URL — updated when server returns a new one after save
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | undefined>(initialData.logo_url)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const formDict = dict.form
  const infoCardDict = formDict.cards.information
  const mediaCardDict = formDict.cards.media

  useEffect(() => {
    if (state.status !== 'idle' && state.notificationToken) {
      notifyFromApi({
        httpStatus: state.httpStatus || 500,
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        lang,
        actionType: 'update',
      })
    }
  }, [
    state.status,
    state.notificationToken,
    state.httpStatus,
    dict.notifications,
    common.notifications,
    lang,
  ])

  const handleLogoChange = async (uploadedFiles: UploadedFile[]) => {
    if (!permissions.update) return
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0].file
      const formData = new FormData()
      formData.append('logo', file)

      setIsUploadingLogo(true)
      try {
        const newLogoUrl = await uploadLogoAction(formData)
        if (newLogoUrl) {
          setCurrentLogoUrl(newLogoUrl)
          toast.success(common.notifications.success_update)
        } else {
          toast.error(common.notifications.error)
        }
      } catch (err) {
        console.error(err)
        toast.error(common.notifications.error)
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
            <CardTitle>{infoCardDict.title}</CardTitle>
            <CardDescription>{infoCardDict.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet disabled={!permissions.update}>
              <FieldGroup>
                {/* Name */}
                <Field data-invalid={!!state.fieldErrors?.name}>
                  <FieldLabel htmlFor="general-name">{formDict.name.label}</FieldLabel>
                  <Input
                    id="general-name"
                    name="name"
                    defaultValue={initialData.name}
                    placeholder={formDict.name.placeholder}
                    aria-invalid={!!state.fieldErrors?.name}
                    disabled={!permissions.update}
                  />
                  <FieldDescription>{formDict.name.description}</FieldDescription>
                  {state.fieldErrors?.name && <FieldError>{state.fieldErrors.name}</FieldError>}
                </Field>

                {/* Domain */}
                <Field data-invalid={!!state.fieldErrors?.domain}>
                  <FieldLabel htmlFor="general-domain">{formDict.domain.label}</FieldLabel>
                  <Input
                    id="general-domain"
                    name="domain"
                    defaultValue={initialData.domain}
                    placeholder={formDict.domain.placeholder}
                    aria-invalid={!!state.fieldErrors?.domain}
                    disabled={!permissions.update}
                  />
                  <FieldDescription>{formDict.domain.description}</FieldDescription>
                  {state.fieldErrors?.domain && <FieldError>{state.fieldErrors.domain}</FieldError>}
                </Field>

                {/* Description */}
                <Field data-invalid={!!state.fieldErrors?.description}>
                  <FieldLabel htmlFor="general-description">
                    {formDict.description.label}
                  </FieldLabel>
                  <Textarea
                    id="general-description"
                    name="description"
                    defaultValue={initialData.description}
                    placeholder={formDict.description.placeholder}
                    rows={4}
                    aria-invalid={!!state.fieldErrors?.description}
                    disabled={!permissions.update}
                  />
                  <FieldDescription>{formDict.description.description}</FieldDescription>
                  {state.fieldErrors?.description && (
                    <FieldError>{state.fieldErrors.description}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" type="reset" disabled={isPending || !permissions.update}>
                {common.form.actions.discard}
              </Button>
              <Button type="submit" disabled={isPending || !permissions.update}>
                {isPending ? (
                  <>
                    <Spinner className="mr-2" />
                    {common.form.actions.saving}
                  </>
                ) : (
                  common.form.actions.save
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
            {mediaCardDict.title}
            {isUploadingLogo && <Spinner className="size-4" />}
          </CardTitle>
          <CardDescription>{mediaCardDict.description}</CardDescription>
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
            disabled={!permissions.update}
          />
        </CardContent>
      </Card>
    </div>
  )
}
