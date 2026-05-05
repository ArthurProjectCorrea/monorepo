'use client'

import { DataTable, type DataTableRowAction } from '@/components/custom/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/settings/teams/columns'
import { TeamForm } from '@/components/forms/team-form'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'

import { DataTableDialog } from '@/components/custom/data-table/data-table-dialog'
import { deleteTeamAction } from '@/lib/action/settings'
import type { Team } from '@/types/api'
import type { Dictionary } from '@/types/i18n'

interface TeamTableClientProps {
  teams: Team[]
  dict: Dictionary['teams']
  common: Dictionary['common']
  permissions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  isLoading?: boolean
}

export function TeamTableClient({
  teams,
  dict,
  common,
  permissions,
  isLoading: externalLoading,
}: TeamTableClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('create')
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)

  const columns = React.useMemo(() => getColumns(dict, common), [dict, common])

  const handleEdit = React.useCallback(
    (team: Team) => {
      if (!permissions.update) return
      setSelectedTeam(team)
      setDialogMode('edit')
      setIsDialogOpen(true)
    },
    [permissions.update],
  )

  const handleAdd = React.useCallback(() => {
    if (!permissions.create) return
    setSelectedTeam(null)
    setDialogMode('create')
    setIsDialogOpen(true)
  }, [permissions.create])

  const handleDelete = async (team: Team) => {
    if (!permissions.delete) return
    startTransition(async () => {
      const result = await deleteTeamAction(team.id)
      if (result.status === 'success') {
        toast.success(common.notifications.success_delete)
      } else {
        toast.error(common.notifications.error)
      }
    })
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback((): DataTableRowAction<Team>[] => [], [])

  const dialogTitle =
    dialogMode === 'edit'
      ? common.dialogs.update_dialog.title.replace('{name}', selectedTeam?.name || '')
      : common.dialogs.create_dialog.title.replace('{name}', dict.table.column_name)

  return (
    <>
      <DataTable
        key="teams-data-table"
        columns={columns}
        data={teams}
        dict={{ common }}
        filterColumn="name"
        searchPlaceholder={dict.table.column_name + '...'}
        onEdit={permissions.update ? handleEdit : undefined}
        onDelete={permissions.delete ? handleDelete : undefined}
        onAddClick={permissions.create ? handleAdd : undefined}
        customActions={getCustomActions}
        createForm={TeamForm}
        itemTitleColumn="name"
        mobileTitleColumn="icon"
        mobileStatusColumn="status"
        isLoading={externalLoading || isPending}
        onRefresh={handleRefresh}
      />

      <DataTableDialog
        key="team-form-dialog"
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={dialogTitle}
        description={dialogMode === 'edit' ? common.dialogs.update_dialog.description : undefined}
        dict={{ common }}
      >
        <TeamForm
          key={selectedTeam?.id || 'new'}
          row={selectedTeam || ({} as Team)}
          onSuccess={() => setIsDialogOpen(false)}
          dict={dict}
          common={common}
        />
      </DataTableDialog>
    </>
  )
}
