'use client'

import * as React from 'react'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import type { Team, TeamFormDict } from '@/types/api'
import { updateTeamAction, createTeamAction } from '@/lib/action/teams'

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import * as LucideIcons from 'lucide-react'

interface TeamFormProps {
  row: Team
  onSuccess?: () => void
  dict: TeamFormDict
}

export function TeamForm({ row, onSuccess, dict }: TeamFormProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [iconName, setIconName] = React.useState('')
  const [name, setName] = React.useState('')
  const [status, setStatus] = React.useState(true)

  const formatIconName = React.useCallback((name: string) => {
    if (!name) return ''
    // Convert kebab-case or space-separated to PascalCase for Lucide
    return name
      .split(/[- ]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('')
  }, [])

  // Sync state with row changes (important for mock data switching)
  React.useEffect(() => {
    setIconName(row.icon || '')
    setName(row.name || '')
    setStatus(row.status ?? true)
  }, [row])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PreviewIcon = (LucideIcons as any)[formatIconName(iconName)] || LucideIcons.HelpCircle

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    formData.append('id', row.id)

    // Send icon name exactly as entered to preserve original casing/format
    const rawIcon = formData.get('icon') as string
    formData.set('icon', rawIcon)

    // Convert switch "on" to explicit "true"/"false" string for the server action
    formData.set('status', status ? 'true' : 'false')

    try {
      const result = row.id
        ? await updateTeamAction({ status: 'idle' }, formData)
        : await createTeamAction({ status: 'idle' }, formData)

      if (result.status === 'success') {
        toast.success(dict.notifications.success)
        onSuccess?.()
      } else {
        toast.error(dict.notifications.error)
      }
    } catch (error) {
      toast.error(dict.notifications.error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="team-name">{dict.table.form.title_label}</FieldLabel>
          <Input
            id="team-name"
            name="name"
            placeholder={dict.table.form.title_placeholder}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <FieldDescription>{dict.table.form.title_description}</FieldDescription>
          <FieldError />
        </Field>

        <Field>
          <FieldLabel htmlFor="team-icon">{dict.table.form.icon_label}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="team-icon"
              name="icon"
              placeholder={dict.table.form.icon_placeholder}
              value={iconName}
              onChange={e => setIconName(e.target.value)}
            />
            <InputGroupAddon align="inline-end" className="pointer-events-none px-3">
              <PreviewIcon className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription>{dict.table.form.icon_description}</FieldDescription>
          <FieldError />
        </Field>

        <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FieldLabel htmlFor="team-status" className="text-base">
              {dict.table.form.status_label}
            </FieldLabel>
            <FieldDescription>{dict.table.form.status_description}</FieldDescription>
          </div>
          <Switch id="team-status" name="status" checked={status} onCheckedChange={setStatus} />
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
          ) : row.id ? (
            dict.common.actions.save
          ) : (
            dict.common.actions.create
          )}
        </Button>
      </div>
    </form>
  )
}
