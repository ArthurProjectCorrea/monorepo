'use client'

import * as React from 'react'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import type { Screen, ScreenFormDict } from '@/types/api'

interface ScreenFormProps {
  row: Screen
  onSuccess?: () => void
  dict: ScreenFormDict
}

import { updateScreenAction } from '@/lib/action/screens'

export function ScreenForm({ row, onSuccess, dict }: ScreenFormProps) {
  const [isPending, setIsPending] = React.useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    formData.append('id', row.id)

    // Convert switch "on" to explicit "true"/"false" string for the server action
    const isActive = formData.get('isActive') === 'on'
    formData.set('isActive', isActive ? 'true' : 'false')

    const result = await updateScreenAction({ status: 'idle' }, formData)

    setIsPending(false)
    if (result.status === 'success') {
      toast.success(dict.notifications.success)
      onSuccess?.()
    } else {
      toast.error(dict.notifications.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">{dict.table.form.title_label}</FieldLabel>
          <Input
            id="title"
            name="title"
            placeholder={dict.table.form.title_placeholder}
            defaultValue={row.title}
            required
          />
          <FieldDescription>{dict.table.form.title_description}</FieldDescription>
          <FieldError />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">{dict.table.form.description_label}</FieldLabel>
          <Textarea
            id="description"
            name="description"
            placeholder={dict.table.form.description_placeholder}
            defaultValue={row.description}
            rows={4}
          />
          <FieldDescription>{dict.table.form.description_description}</FieldDescription>
          <FieldError />
        </Field>

        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FieldLabel htmlFor="isActive" className="text-base">
              {dict.table.form.status_label}
            </FieldLabel>
            <FieldDescription>{dict.table.form.status_description}</FieldDescription>
          </div>
          <Switch id="isActive" name="isActive" defaultChecked={row.isActive} />
        </Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" type="button" disabled={isPending} onClick={() => onSuccess?.()}>
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
    </form>
  )
}
