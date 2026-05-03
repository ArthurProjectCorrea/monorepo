'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { User, UserFormDict } from '@/types/api'

export const getColumns = (dict: UserFormDict): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: dict.table.column_name,
    meta: { title: dict.table.column_name },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: dict.table.column_email,
    meta: { title: dict.table.column_email },
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'isActive',
    header: dict.table.column_status,
    meta: { title: dict.table.column_status },
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
    header: dict.table.column_updated_at,
    meta: { title: dict.table.column_updated_at },
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
