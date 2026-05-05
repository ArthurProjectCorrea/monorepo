import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Dictionary } from '@/types/i18n'
import type { AccessProfile } from '@/types/api'

export const getColumns = (
  dict: Dictionary['access_profiles'],
  common: Dictionary['common'],
): ColumnDef<AccessProfile>[] => [
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
