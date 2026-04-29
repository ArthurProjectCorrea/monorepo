import type { ColumnDef, HeaderContext, CellContext } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header'
import type { Team, TeamFormDict } from '@/types/api'
import * as LucideIcons from 'lucide-react'

const formatIconName = (name: string) => {
  if (!name) return ''
  return name
    .split(/[- ]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
}

export const getColumns = (dict: TeamFormDict): ColumnDef<Team>[] => [
  {
    accessorKey: 'name',
    header: ({ column }: HeaderContext<Team, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_name} />
    ),
    cell: ({ row }: CellContext<Team, unknown>) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
    meta: { title: dict.table.column_name },
  },
  {
    accessorKey: 'icon',
    header: ({ column }: HeaderContext<Team, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.table.column_icon} />
    ),
    cell: ({ row }: CellContext<Team, unknown>) => {
      const rawIconName = row.getValue('icon') as string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Icon = (LucideIcons as any)[formatIconName(rawIconName)] || LucideIcons.Users
      return (
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Icon className="size-4" />
        </div>
      )
    },
    meta: { title: dict.table.column_icon },
  },
  {
    accessorKey: 'status',
    header: ({ column }: HeaderContext<Team, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.common.table.column_status} />
    ),
    cell: ({ row }: CellContext<Team, unknown>) => {
      const status = !!row.getValue('status')
      return (
        <Badge variant={status ? 'default' : 'secondary'} className="capitalize">
          {status ? dict.common.table.status_active : dict.common.table.status_inactive}
        </Badge>
      )
    },
    meta: { title: dict.common.table.column_status },
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }: HeaderContext<Team, unknown>) => (
      <DataTableColumnHeader column={column} title={dict.common.table.column_updated_at} />
    ),
    cell: ({ row }: CellContext<Team, unknown>) => {
      const dateValue = row.getValue('updated_at') as string
      const date = new Date(dateValue)
      return (
        <span className="text-muted-foreground">
          {isNaN(date.getTime()) ? dateValue : date.toLocaleDateString()}
        </span>
      )
    },
    meta: { title: dict.common.table.column_updated_at },
  },
]
