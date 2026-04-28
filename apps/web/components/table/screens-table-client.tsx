'use client'

import { Copy } from 'lucide-react'
import { DataTable, type DataTableRowAction } from '@/components/data-table/data-table'
import { getColumns, type Screen } from '@/app/[lang]/[domain]/parameters/screens/columns'
import type { DataTableDict } from '@/types/data-table'
import { toast } from 'sonner'

interface ScreensTableClientProps {
  screens: Screen[]
  dictDataTable: DataTableDict
  dictScreensPage: {
    table: {
      column_key: string
      column_title: string
      column_description: string
      column_status: string
      column_updated: string
      status_active: string
      status_inactive: string
      actions: string
      action_edit: string
      action_copy_key: string
    }
  }
}

export function ScreensTableClient({
  screens,
  dictDataTable,
  dictScreensPage,
}: ScreensTableClientProps) {
  const columns = getColumns(dictScreensPage)

  const handleEdit = (screen: Screen) => {
    toast.info(`Editing screen: ${screen.title}`)
  }

  const handleDelete = (screen: Screen) => {
    toast.error(`Delete requested for: ${screen.title}`)
  }

  const getCustomActions = (_screen: Screen): DataTableRowAction<Screen>[] => [
    {
      label: dictScreensPage.table.action_copy_key,
      icon: <Copy className="h-4 w-4" />,
      onClick: s => {
        navigator.clipboard.writeText(s.screenKey)
        toast.success(dictScreensPage.table.action_copy_key)
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={screens}
      dict={dictDataTable}
      filterColumn="title"
      searchPlaceholder={dictScreensPage.table.column_title + '...'}
      onEdit={handleEdit}
      onDelete={handleDelete}
      customActions={getCustomActions}
    />
  )
}
