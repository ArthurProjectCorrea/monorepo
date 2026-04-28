'use client'

import { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

export type Screen = {
  id: string
  screenKey: string
  title: string
  description: string
  isActive: boolean
  updatedAt: string
}

export const getColumns = (dict: {
  table: {
    column_key: string
    column_title: string
    column_description: string
    column_status: string
    column_updated: string
    status_active: string
    status_inactive: string
  }
}): ColumnDef<Screen>[] => [
  {
    accessorKey: 'screenKey',
    header: ({ column }: HeaderContext<Screen, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_key} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => (
      <div className="font-mono text-xs">{row.getValue('screenKey')}</div>
    ),
    meta: { title: dict.table.column_key },
  },
  {
    accessorKey: 'title',
    header: ({ column }: HeaderContext<Screen, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_title} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => (
      <div className="font-medium">{row.getValue('title')}</div>
    ),
    meta: { title: dict.table.column_title },
  },
  {
    accessorKey: 'description',
    header: ({ column }: HeaderContext<Screen, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_description} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.getValue('description')}
      </div>
    ),
    meta: { title: dict.table.column_description },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }: HeaderContext<Screen, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_status} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? dict.table.status_active : dict.table.status_inactive}
        </Badge>
      )
    },
    meta: { title: dict.table.column_status },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }: HeaderContext<Screen, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_updated} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => {
      const date = new Date(row.getValue('updatedAt'))
      return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
    },
    meta: { title: dict.table.column_updated },
  },
]
