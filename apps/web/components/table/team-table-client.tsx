'use client'

import { DataTable, type DataTableRowAction } from '@/components/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/settings/teams/columns'
import { TeamForm } from '@/components/forms/team-form'
import type { DataTableDict } from '@/types/data-table'
import type { Team, TeamFormDict } from '@/types/api'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { deleteTeamAction } from '@/lib/action/teams'
import { toast } from 'sonner'

import { DataTableDialog } from '@/components/data-table/data-table-dialog'

interface TeamTableClientProps {
  teams: Team[]
  dictDataTable: DataTableDict
  dictTeamsPage: TeamFormDict
  isLoading?: boolean
}

export function TeamTableClient({
  teams,
  dictDataTable,
  dictTeamsPage,
  isLoading: externalLoading,
}: TeamTableClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('create')
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)

  const columns = React.useMemo(() => getColumns(dictTeamsPage), [dictTeamsPage])

  const handleEdit = React.useCallback((team: Team) => {
    setSelectedTeam(team)
    setDialogMode('edit')
    setIsDialogOpen(true)
  }, [])

  const handleAdd = React.useCallback(() => {
    setSelectedTeam(null)
    setDialogMode('create')
    setIsDialogOpen(true)
  }, [])

  const handleDelete = async (team: Team) => {
    startTransition(async () => {
      const result = await deleteTeamAction(team.id)
      if (result.status === 'success') {
        toast.success(dictTeamsPage.notifications.success)
      } else {
        toast.error(dictTeamsPage.notifications.error)
      }
    })
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback((): DataTableRowAction<Team>[] => [], [])

  const editFormProps = React.useMemo(() => ({ dict: dictTeamsPage }), [dictTeamsPage])

  const dialogTitle =
    dialogMode === 'edit'
      ? dictTeamsPage.common.dialogs.edit_dialog.title.replace('{item}', selectedTeam?.name || '')
      : dictTeamsPage.common.actions.create

  return (
    <>
      <DataTable
        key="teams-data-table"
        columns={columns}
        data={teams}
        dict={dictDataTable}
        filterColumn="name"
        searchPlaceholder={dictTeamsPage.table.column_name + '...'}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddClick={handleAdd}
        customActions={getCustomActions}
        createForm={TeamForm} // Still needed to show the button
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
        description={
          dialogMode === 'edit' ? dictTeamsPage.common.dialogs.edit_dialog.description : undefined
        }
        dict={dictDataTable}
      >
        <TeamForm
          key={selectedTeam?.id || 'new'}
          row={selectedTeam || ({} as Team)}
          onSuccess={() => setIsDialogOpen(false)}
          {...editFormProps}
        />
      </DataTableDialog>
    </>
  )
}
