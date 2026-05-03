'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Item, ItemActions, ItemContent, ItemGroup } from '@/components/ui/item'
import { FormActions } from '@/components/layout/form-actions'
import { saveUserAction } from '@/lib/action/users'
import type { User, UserTeamAccess, UserFormDict } from '@/types/api'

interface UserFormProps {
  initialData?: User
  onSuccess?: () => void
  dict: UserFormDict
  teams: { id: string; name: string }[]
  accessProfiles: { id: string; name: string }[]
}

export function UserForm({ initialData, onSuccess, dict, teams, accessProfiles }: UserFormProps) {
  const router = useRouter()
  const params = useParams()
  const [state, formAction, isPending] = React.useActionState(saveUserAction, {
    status: 'idle',
  })

  // Local state for teams/profiles association
  const [userTeams, setUserTeams] = React.useState<UserTeamAccess[]>(
    initialData?.teams || [{ teamId: '', profileId: '' }],
  )

  const addTeamAssociation = () => {
    if (userTeams.length >= teams.length) {
      toast.warning('Todos os times disponíveis já foram adicionados.')
      return
    }
    setUserTeams(prev => [...prev, { teamId: '', profileId: '' }])
  }

  const removeTeamAssociation = (index: number) => {
    setUserTeams(prev => prev.filter((_, i) => i !== index))
  }

  const updateTeamAssociation = (index: number, field: keyof UserTeamAccess, value: string) => {
    setUserTeams(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const formRef = React.useRef<HTMLFormElement>(null)

  const handleDiscard = React.useCallback(() => {
    if (formRef.current) {
      formRef.current.reset()
    }
    setUserTeams(initialData?.teams || [{ teamId: '', profileId: '' }])
    toast.info(dict.common.actions.discard)
  }, [initialData, dict.common.actions])

  // Handle Action State notifications
  React.useEffect(() => {
    if (state.status === 'success') {
      toast.success(dict.notifications.success)

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/${params.lang}/${params.domain}/settings/users`)
      }
    } else if (state.status === 'error') {
      toast.error(dict.notifications.error)
    }
  }, [
    state.status,
    state.notificationToken,
    dict.notifications,
    onSuccess,
    router,
    params.lang,
    params.domain,
  ])

  return (
    <form action={formAction} ref={formRef}>
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="teams" value={JSON.stringify(userTeams)} />

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
                  <FieldLabel htmlFor="user-name">{dict.table.form.name_label}</FieldLabel>
                  <Input
                    id="user-name"
                    name="name"
                    defaultValue={initialData?.name}
                    placeholder={dict.table.form.name_placeholder}
                    required
                  />
                  <FieldDescription>{dict.table.form.name_description}</FieldDescription>
                  <FieldError>{state.fieldErrors?.name}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="user-email">{dict.table.form.email_label}</FieldLabel>
                  <Input
                    id="user-email"
                    name="email"
                    type="email"
                    defaultValue={initialData?.email}
                    placeholder={dict.table.form.email_placeholder}
                    required
                  />
                  <FieldDescription>{dict.table.form.email_description}</FieldDescription>
                  <FieldError>{state.fieldErrors?.email}</FieldError>
                </Field>

                <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor="user-status" className="text-base">
                      {dict.table.form.status_label}
                    </FieldLabel>
                    <FieldDescription>{dict.table.form.status_description}</FieldDescription>
                  </div>
                  <Switch
                    id="user-status"
                    name="isActive"
                    defaultChecked={initialData?.isActive ?? true}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
          </CardContent>
        </Card>

        {/* Teams & Access Profiles Column */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>{dict.table.form.teams_section_title}</CardTitle>
            <CardDescription>{dict.table.form.teams_section_description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTeamAssociation}
              className="w-full gap-1 sm:w-auto"
            >
              <Plus className="size-4" />
              {dict.table.form.add_team_button}
            </Button>

            <ItemGroup>
              {userTeams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                  <p className="text-sm text-muted-foreground">{dict.table.form.empty_teams}</p>
                </div>
              )}
              {userTeams.map((assoc, index) => (
                <Item
                  key={index}
                  variant="outline"
                  className="bg-muted/20 p-4 border-dashed transition-colors hover:bg-muted/30"
                >
                  <ItemContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold">
                        {dict.table.form.column_team}
                      </FieldLabel>
                      <Select
                        value={assoc.teamId}
                        onValueChange={val => updateTeamAssociation(index, 'teamId', val)}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder={dict.table.form.select_team_placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {teams
                            .filter(
                              team =>
                                team.id === assoc.teamId ||
                                !userTeams.some(ut => ut.teamId === team.id),
                            )
                            .map(team => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold">
                        {dict.table.form.column_profile}
                      </FieldLabel>
                      <Select
                        value={assoc.profileId}
                        onValueChange={val => updateTeamAssociation(index, 'profileId', val)}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder={dict.table.form.select_profile_placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {accessProfiles.map(profile => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </ItemContent>
                  <ItemActions className="pt-4 sm:pt-0 sm:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTeamAssociation(index)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                      disabled={userTeams.length <= 1 && !assoc.teamId && !assoc.profileId}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </ItemActions>
                </Item>
              ))}
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
        onDiscard={handleDiscard}
        onBack={() => router.push(`/${params.lang}/${params.domain}/settings/users`)}
      />
    </form>
  )
}
