'use client'

import { DataTable, type DataTableRowAction } from '@/components/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/parameters/screens/columns'
import { ScreenForm } from '@/components/forms/screen-form'
import type { DataTableDict } from '@/types/data-table'
import type { Screen, ScreenFormDict } from '@/types/api'
import { useRouter } from 'next/navigation'
import * as React from 'react'

interface ScreensTableClientProps {
  screens: Screen[]
  dictDataTable: DataTableDict
  dictScreensPage: ScreenFormDict
  isLoading?: boolean
}

export function ScreensTableClient({
  screens,
  dictDataTable,
  dictScreensPage,
  isLoading: externalLoading,
}: ScreensTableClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const columns = React.useMemo(() => getColumns(dictScreensPage), [dictScreensPage])

  const handleEdit = (screen: Screen) => {
    console.log('Edit clicked for:', screen.title)
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback((): DataTableRowAction<Screen>[] => [], [])

  const editFormProps = React.useMemo(() => ({ dict: dictScreensPage }), [dictScreensPage])

  return (
    <DataTable
      columns={columns}
      data={screens}
      dict={dictDataTable}
      filterColumn="title"
      searchPlaceholder={dictScreensPage.table.column_title + '...'}
      onEdit={handleEdit}
      customActions={getCustomActions}
      editForm={ScreenForm}
      editFormProps={editFormProps}
      itemTitleColumn="title"
      mobileTitleColumn="screenKey"
      mobileStatusColumn="isActive"
      isLoading={externalLoading || isPending}
      onRefresh={handleRefresh}
    />
  )
}
