'use client'

import { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'

import type { Screen, ScreenFormDict } from '@/types/api'

export const getColumns = (dict: ScreenFormDict): ColumnDef<Screen>[] => [
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
      <DataTableColumnHeader column={column} title={dict.common.table.column_status} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? dict.common.table.status_active : dict.common.table.status_inactive}
        </Badge>
      )
    },
    meta: { title: dict.common.table.column_status },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }: HeaderContext<Screen, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.common.table.column_updated_at} />
    ),
    cell: ({ row }: CellContext<Screen, unknown>) => {
      const date = new Date(row.getValue('updatedAt'))
      return <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
    },
    meta: { title: dict.common.table.column_updated_at },
  },
]
