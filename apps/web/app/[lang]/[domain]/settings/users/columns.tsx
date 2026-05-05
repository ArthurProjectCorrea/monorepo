import type { ColumnDef } from '@tanstack/react-table'
import type { User } from '@/types/api'
import type { Dictionary } from '@/types/i18n'
import { Badge } from '@/components/ui/badge'

export const getColumns = (
  dict: Dictionary['users'],
  common: Dictionary['common'],
): ColumnDef<User>[] => [
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
    accessorKey: 'is_active',
    header: common.table.column_status,
    meta: { title: common.table.column_status },
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? common.table.status_active : common.table.status_inactive}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'updated_at',
    header: common.table.column_updated_at,
    meta: { title: common.table.column_updated_at },
    cell: ({ row }) => {
      const value = row.getValue('updated_at') as string
      if (!value) return <div className="text-muted-foreground">-</div>

      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return <div className="text-muted-foreground">-</div>
      }

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
