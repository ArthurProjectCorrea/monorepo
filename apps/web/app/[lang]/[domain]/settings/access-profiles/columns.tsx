'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { AccessProfile, AccessProfileFormDict } from '@/types/api'

export const getColumns = (dict: AccessProfileFormDict): ColumnDef<AccessProfile>[] => [
  {
    accessorKey: 'name',
    header: dict.table.column_name,
    meta: { title: dict.table.column_name },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'description',
    header: dict.table.column_description,
    meta: { title: dict.table.column_description },
    cell: ({ row }) => (
      <div className="max-w-[400px] truncate text-muted-foreground">
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: dict.common.table.column_status,
    meta: { title: dict.common.table.column_status },
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? dict.common.table.status_active : dict.common.table.status_inactive}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: dict.common.table.column_updated_at,
    meta: { title: dict.common.table.column_updated_at },
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'))
      return (
        <div className="text-muted-foreground">
          {new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(date)}
        </div>
      )
    },
  },
]
