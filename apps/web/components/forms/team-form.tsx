'use client'

import * as React from 'react'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import * as LucideIcons from 'lucide-react'
import { saveTeamAction } from '@/lib/action/settings'
import { notifyFromApi } from '@/lib/notifications'
import type { Dictionary } from '@/types/i18n'
import type { Team } from '@/types/api'

interface TeamFormProps {
  row: Team
  onSuccess?: () => void
  dict: Dictionary['teams']
  common: Dictionary['common']
}

export function TeamForm({ row, onSuccess, dict, common }: TeamFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [iconName, setIconName] = React.useState('')
  const [name, setName] = React.useState('')
  const [status, setStatus] = React.useState(true)

  const formDict = dict.form

  const formatIconName = React.useCallback((name: string) => {
    if (!name) return ''
    return name
      .split(/[- ]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('')
  }, [])

  React.useEffect(() => {
    setIconName(row.icon || '')
    setName(row.name || '')
    setStatus(row.isActive ?? true)
  }, [row])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PreviewIcon = (LucideIcons as any)[formatIconName(iconName)] || LucideIcons.HelpCircle

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append('id', row.id)

    const rawIcon = formData.get('icon') as string
    formData.set('icon', rawIcon)
    formData.set('status', status ? 'true' : 'false')

    try {
      const result = await saveTeamAction({ status: 'idle' }, formData)

      notifyFromApi({
        httpStatus: result.httpStatus || (result.status === 'success' ? 200 : 500),
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        actionType: row.id === 'new' ? 'create' : 'update',
      })

      if (result.status === 'success') {
        onSuccess?.()
      }
    } catch {
      notifyFromApi({
        httpStatus: 500,
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="team-name">{formDict.name.label}</FieldLabel>
          <Input
            id="team-name"
            name="name"
            placeholder={formDict.name.placeholder}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <FieldDescription>{formDict.name.description}</FieldDescription>
          <FieldError />
        </Field>

        <Field>
          <FieldLabel htmlFor="team-icon">{formDict.icon.label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="team-icon"
              name="icon"
              placeholder={formDict.icon.placeholder}
              value={iconName}
              onChange={e => setIconName(e.target.value)}
            />
            <InputGroupAddon align="inline-end" className="pointer-events-none px-3">
              <PreviewIcon className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>{formDict.icon.description}</FieldDescription>
          <FieldError />
        </Field>

        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FieldLabel htmlFor="team-status" className="text-base">
              {common.form.is_active.label}
            </FieldLabel>
            <FieldDescription>{formDict.is_active.description}</FieldDescription>
          </div>
          <Switch id="team-status" name="status" checked={status} onCheckedChange={setStatus} />
        </Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" type="button" disabled={isPending} onClick={() => onSuccess?.()}>
          {!row.id ? common.dialogs.create_dialog.cancel : common.dialogs.update_dialog.discard}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Spinner className="mr-2" />
              {common.form.actions.saving}
            </>
          ) : !row.id ? (
            common.dialogs.create_dialog.save
          ) : (
            common.dialogs.update_dialog.save
          )}
        </Button>
      </div>
    </form>
  )
}
