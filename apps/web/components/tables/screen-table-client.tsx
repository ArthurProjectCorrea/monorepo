'use client'

import { DataTable, type DataTableRowAction } from '@/components/custom/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/parameters/screens/columns'
import { ScreenForm } from '@/components/forms/screen-form'
import type { Screen } from '@/types/api'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import type { Dictionary } from '@/types/i18n'

interface ScreensTableClientProps {
  screens: Screen[]
  dict: Dictionary['screen_parameters']
  common: Dictionary['common']
  permissions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  isLoading?: boolean
}

export function ScreensTableClient({
  screens,
  dict,
  common,
  permissions,
  isLoading: externalLoading,
}: ScreensTableClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const columns = React.useMemo(() => getColumns(dict, common), [dict, common])

  const handleEdit = (screen: Screen) => {
    if (!permissions.update) return
    console.log('Edit clicked for:', screen.title)
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback((): DataTableRowAction<Screen>[] => [], [])

  return (
    <DataTable
      columns={columns}
      data={screens}
      dict={{ common }}
      filterColumn="title"
      searchPlaceholder={dict.table.column_title + '...'}
      onEdit={permissions.update ? handleEdit : undefined}
      customActions={getCustomActions}
      editForm={ScreenForm}
      editFormProps={{ dict, common }}
      itemTitleColumn="title"
      mobileTitleColumn="screenKey"
      mobileStatusColumn="isActive"
      isLoading={externalLoading || isPending}
      onRefresh={handleRefresh}
    />
  )
}
