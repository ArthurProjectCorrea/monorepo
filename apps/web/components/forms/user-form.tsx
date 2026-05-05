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
import { saveUserAction } from '@/lib/action/settings'
import { notifyFromApi } from '@/lib/notifications'
import type { Dictionary } from '@/types/i18n'
import type { User, UserTeamAccess } from '@/types/api'

interface UserFormProps {
  initialData?: User
  onSuccess?: () => void
  dict: Dictionary['users']
  common: Dictionary['common']
  teams: { id: string; name: string }[]
  accessProfiles: { id: string; name: string }[]
}

export function UserForm({
  initialData,
  onSuccess,
  dict,
  common,
  teams,
  accessProfiles,
}: UserFormProps) {
  const router = useRouter()
  const params = useParams()
  const [state, formAction, isPending] = React.useActionState(saveUserAction, {
    status: 'idle',
  })

  // Local state for teams/profiles association
  const [userTeams, setUserTeams] = React.useState<UserTeamAccess[]>(
    initialData?.teams || [{ teamId: '', profileId: '' }],
  )

  const formDict = dict.form
  const infoCardDict = formDict.cards.information
  const teamsCardDict = formDict.cards.teams_profiles

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
    toast.info(common.form.actions.discard)
  }, [initialData, common.form.actions])

  // Handle Action State notifications
  React.useEffect(() => {
    if (state.status !== 'idle' && state.notificationToken) {
      notifyFromApi({
        httpStatus: state.httpStatus || (state.status === 'success' ? 200 : 500),
        dictionary: dict.notifications,
        commonDictionary: common.notifications,
        lang: (params.lang as string) || 'en',
        actionType: initialData ? 'update' : 'create',
      })

      if (state.status === 'success') {
        if (onSuccess) {
          onSuccess()
        } else {
          router.push(`/${params.lang}/${params.domain}/settings/users`)
        }
      }
    }
  }, [
    state.status,
    state.notificationToken,
    state.httpStatus,
    dict.notifications,
    common.notifications,
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
            <CardTitle>{infoCardDict.title}</CardTitle>
            <CardDescription>{infoCardDict.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="user-name">{formDict.name.label}</FieldLabel>
                  <Input
                    id="user-name"
                    name="name"
                    defaultValue={initialData?.name}
                    placeholder={formDict.name.placeholder}
                    required
                  />
                  <FieldDescription>{formDict.name.description}</FieldDescription>
                  <FieldError>{state.fieldErrors?.name}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="user-email">{formDict.email.label}</FieldLabel>
                  <Input
                    id="user-email"
                    name="email"
                    type="email"
                    defaultValue={initialData?.email}
                    placeholder={formDict.email.placeholder}
                    required
                  />
                  <FieldDescription>{formDict.email.description}</FieldDescription>
                  <FieldError>{state.fieldErrors?.email}</FieldError>
                </Field>

                <Field className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FieldLabel htmlFor="user-status" className="text-base">
                      {common.form.is_active.label}
                    </FieldLabel>
                    <FieldDescription>{formDict.is_active.description}</FieldDescription>
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
            <CardTitle>{teamsCardDict.title}</CardTitle>
            <CardDescription>{teamsCardDict.description}</CardDescription>
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
              {formDict.table_teams_profiles.add_button}
            </Button>

            <ItemGroup>
              {userTeams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                  <p className="text-sm text-muted-foreground">
                    {formDict.table_teams_profiles.empty_teams_profiles}
                  </p>
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
                        {formDict.table_teams_profiles.column_teams}
                      </FieldLabel>
                      <Select
                        value={assoc.teamId}
                        onValueChange={val => updateTeamAssociation(index, 'teamId', val)}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue
                            placeholder={formDict.table_teams_profiles.select_team_placeholder}
                          />
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
                        {formDict.table_teams_profiles.column_access_profiles}
                      </FieldLabel>
                      <Select
                        value={assoc.profileId}
                        onValueChange={val => updateTeamAssociation(index, 'profileId', val)}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue
                            placeholder={
                              formDict.table_teams_profiles.select_access_profile_placeholder
                            }
                          />
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
        saveLabel={common.form.actions.save}
        discardLabel={common.form.actions.discard}
        savingLabel={common.form.actions.saving}
        backLabel={common.form.actions.back}
        isPending={isPending}
        onDiscard={handleDiscard}
        onBack={() => router.push(`/${params.lang}/${params.domain}/settings/users`)}
      />
    </form>
  )
}
