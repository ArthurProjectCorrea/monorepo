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
  const columns = React.useMemo(() => getColumns(dictTeamsPage), [dictTeamsPage])

  const handleEdit = (team: Team) => {
    console.log('Edit clicked for:', team.name)
  }

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

  return (
    <DataTable
      columns={columns}
      data={teams}
      dict={dictDataTable}
      filterColumn="name"
      searchPlaceholder={dictTeamsPage.table.column_name + '...'}
      onEdit={handleEdit}
      onDelete={handleDelete}
      customActions={getCustomActions}
      editForm={TeamForm}
      editFormProps={editFormProps}
      itemTitleColumn="name"
      mobileTitleColumn="icon"
      mobileStatusColumn="status"
      isLoading={externalLoading || isPending}
      onRefresh={handleRefresh}
    />
  )
}
