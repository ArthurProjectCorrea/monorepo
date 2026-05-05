'use client'

import * as React from 'react'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import type { Dictionary } from '@/types/i18n'
import type { Screen } from '@/types/api'

interface ScreenFormProps {
  row: Screen
  onSuccess?: () => void
  dict: Dictionary['screen_parameters']
  common: Dictionary['common']
}

import { updateScreenParameterAction } from '@/lib/action/parameters'
import { notifyFromApi } from '@/lib/notifications'

export function ScreenForm({ row, onSuccess, dict, common }: ScreenFormProps) {
  const [isPending, startTransition] = React.useTransition()
  const formDict = dict.form

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const name = formData.get('title') as string
    const description = formData.get('description') as string
    const is_active = formData.get('isActive') === 'on' || formData.get('isActive') === 'true'

    const actionData = new FormData()
    actionData.append('id', row.id)
    actionData.append('name', name)
    actionData.append('description', description)
    actionData.append('is_active', is_active ? 'true' : 'false')

    startTransition(async () => {
      const result = await updateScreenParameterAction({ status: 'idle' }, actionData)

      notifyFromApi({
        httpStatus: result.httpStatus || (result.status === 'success' ? 200 : 500),
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        actionType: 'update',
      })

      if (result.status === 'success') {
        onSuccess?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">{formDict.title.label}</FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder={formDict.title.placeholder}
            defaultValue={row.title}
            required
          />
          <FieldDescription>{formDict.title.description}</FieldDescription>
          <FieldError />
        </Field>

        <Field>
          <FieldLabel htmlFor="screen-description">{formDict.description.label}</FieldLabel>
          <Textarea
            id="screen-description"
            name="description"
            placeholder={formDict.description.placeholder}
            defaultValue={row.description}
            rows={4}
          />
          <FieldDescription>{formDict.description.description}</FieldDescription>
          <FieldError />
        </Field>

        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FieldLabel htmlFor="isActive" className="text-base">
              {common.form.is_active.label}
            </FieldLabel>
            <FieldDescription>{formDict.is_active.description}</FieldDescription>
          </div>
          <Switch id="isActive" name="isActive" defaultChecked={row.isActive} />
        </Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" type="button" disabled={isPending} onClick={() => onSuccess?.()}>
          {common.dialogs.update_dialog.discard}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              {common.form.actions.saving}
            </>
          ) : (
            common.dialogs.update_dialog.save
          )}
        </Button>
      </div>
    </form>
  )
}
