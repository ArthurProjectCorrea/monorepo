'use client'

import * as React from 'react'
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
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

import { Item, ItemActions, ItemContent, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Settings2, Lock } from 'lucide-react'
import { SCREEN_PERMISSIONS } from '@/lib/permission'
import { saveAccessProfileAction } from '@/lib/action/access-profiles'
import { useRouter, useParams } from 'next/navigation'
import { FormActions } from '@/components/layout/form-actions'

import type {
  AccessProfile,
  AccessProfileFormDict,
  AccessProfilePermission,
  PermissionAction,
} from '@/types/api'

interface AccessProfileFormProps {
  initialData?: AccessProfile
  onSuccess?: () => void
  dict: AccessProfileFormDict
  screens: { id: string; title: string }[]
  actions: PermissionAction[]
}

export function AccessProfileForm({
  initialData,
  onSuccess,
  dict,
  screens,
  actions,
}: AccessProfileFormProps) {
  const router = useRouter()
  const params = useParams()
  const [state, formAction, isPending] = React.useActionState(saveAccessProfileAction, {
    status: 'idle',
  })

  // Local state for permissions (pivot table records)
  const [permissions, setPermissions] = React.useState<AccessProfilePermission[]>(
    initialData?.permissions || [],
  )

  const isPermissionSelected = (screenId: string, actionId: string) => {
    return permissions.some(p => p.screenId === screenId && p.actionId === actionId)
  }

  const togglePermission = (screenId: string, actionId: string) => {
    setPermissions(prev => {
      const exists = prev.some(p => p.screenId === screenId && p.actionId === actionId)
      if (exists) {
        return prev.filter(p => !(p.screenId === screenId && p.actionId === actionId))
      } else {
        return [...prev, { profileId: initialData?.id || 'new', screenId, actionId }]
      }
    })
  }

  const getScreenPermissionsCount = (screenId: string) => {
    return permissions.filter(p => p.screenId === screenId).length
  }

  // Handle Action State notifications
  React.useEffect(() => {
    if (state.status === 'success') {
      toast.success(initialData ? dict.notifications.success : dict.notifications.success)
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/${params.lang}/${params.domain}/settings/access-profiles`)
      }
    } else if (state.status === 'error') {
      toast.error(dict.notifications.error)
    }
  }, [
    state.notificationToken,
    initialData,
    dict.notifications.error,
    dict.notifications.success,
    onSuccess,
    router,
    params.lang,
    params.domain,
    state.status,
  ])

  return (
    <form action={formAction}>
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="permissions" value={JSON.stringify(permissions)} />

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-6 min-w-0">
        {/* Basic Info Column */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{dict.table.form.title_label}</CardTitle>
            <CardDescription>{dict.table.form.title_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="profile-name">{dict.table.form.title_label}</FieldLabel>
                  <Input
                    id="profile-name"
                    name="name"
                    defaultValue={initialData?.name}
                    placeholder={dict.table.form.title_placeholder}
                    required
                  />
                  <FieldDescription>{dict.table.form.title_description}</FieldDescription>
                  <FieldError>{state.fieldErrors?.name}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="profile-description">
                    {dict.table.form.description_label}
                  </FieldLabel>
                  <Textarea
                    id="profile-description"
                    name="description"
                    defaultValue={initialData?.description}
                    placeholder={dict.table.form.description_placeholder}
                    rows={4}
                  />
                  <FieldDescription>{dict.table.form.description_description}</FieldDescription>
                  <FieldError>{state.fieldErrors?.description}</FieldError>
                </Field>

                <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor="profile-status" className="text-base">
                      {dict.table.form.status_label}
                    </FieldLabel>
                    <FieldDescription>{dict.table.form.status_description}</FieldDescription>
                  </div>
                  <Switch
                    id="profile-status"
                    name="status"
                    defaultChecked={initialData?.isActive ?? true}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Permissions Column */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{dict.table.form.permissions_section_title}</CardTitle>
            <CardDescription>{dict.table.form.permissions_section_description}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-visible">
            <ItemGroup>
              {screens.map(screen => {
                const allowedActionIds = SCREEN_PERMISSIONS[screen.id] || []
                const availableActions = actions.filter(a => allowedActionIds.includes(a.id))
                const activeCount = getScreenPermissionsCount(screen.id)
                const screenTitle =
                  (dict.sidebar.nav_main as Record<string, string>)[screen.id] || screen.title

                const Trigger = (
                  <Button variant="ghost" size="icon-sm" className="relative">
                    <Settings2 className="size-4" />
                    {activeCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                )

                return (
                  <Item key={screen.id} variant="outline" className="bg-muted/30">
                    <ItemContent>
                      <ItemTitle className="flex items-center gap-2">
                        <Lock className="size-4 text-muted-foreground" />
                        {screenTitle}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>{Trigger}</DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                          <DropdownMenuLabel className="font-medium text-base">
                            {screenTitle}
                          </DropdownMenuLabel>
                          {availableActions.length > 0 && <DropdownMenuSeparator />}
                          {availableActions.map(action => (
                            <DropdownMenuCheckboxItem
                              key={action.id}
                              checked={isPermissionSelected(screen.id, action.id)}
                              onCheckedChange={() => togglePermission(screen.id, action.id)}
                              onSelect={e => e.preventDefault()}
                            >
                              {action.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                          {availableActions.length === 0 && (
                            <div className="p-2 text-xs italic text-muted-foreground">
                              {dict.common.table.no_results}
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </ItemActions>
                  </Item>
                )
              })}
            </ItemGroup>
          </CardContent>
        </Card>
      </div>

      <FormActions
        saveLabel={initialData ? dict.common.actions.save : dict.common.actions.create}
        discardLabel={dict.common.actions.discard}
        savingLabel={dict.common.actions.saving}
        backLabel={dict.common.actions.back}
        isPending={isPending}
        onDiscard={() => (onSuccess ? onSuccess() : router.back())}
        onBack={() => (onSuccess ? onSuccess() : router.back())}
      />
    </form>
  )
}
