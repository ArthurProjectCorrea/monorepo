'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from './data-table-pagination'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableRowActions } from './data-table-row-actions'
import { DataTableRowSkeleton, DataTableRowMobileCardSkeleton } from '../loading/data-table-loading'
import { DataTableRowMobileCard } from './data-table-mobile-card'
import type { DataTableDict } from '@/types/data-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MoreHorizontal, RotateCw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTableDialog } from './data-table-dialog'

export interface DataTableRowAction<TData> {
  label: string
  icon: React.ReactNode
  onClick: (row: TData) => void
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  dict: DataTableDict
  filterColumn?: string
  searchPlaceholder?: string
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  customActions?: (row: TData) => DataTableRowAction<TData>[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editForm?: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editFormProps?: Record<string, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createForm?: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createFormProps?: Record<string, any>
  itemTitleColumn?: string // Column ID to use as title in Edit dialog
  mobileTitleColumn?: string // Column ID for card header title on mobile
  mobileStatusColumn?: string // Column ID for card header status on mobile
  isLoading?: boolean
  onRefresh?: () => void
  onAddClick?: () => void
}

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
  dict,
  filterColumn,
  searchPlaceholder,
  onEdit,
  onDelete,
  customActions,
  editForm,
  editFormProps,
  createForm: CreateForm,
  createFormProps,
  itemTitleColumn,
  mobileTitleColumn,
  mobileStatusColumn,
  isLoading,
  onRefresh,
  onAddClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // ── Construct columns including standard Actions ──────────────────────────
  const columns = React.useMemo(() => {
    const cols = [...userColumns]

    if (onEdit || onDelete || customActions) {
      cols.push({
        id: 'actions',
        header: () => <div className="px-2 text-center">{dict.common.table.actions_column}</div>,
        cell: ({ row }) => {
          const item = row.original
          const extraActions = customActions ? customActions(item) : []
          const hasManyCustom = extraActions.length > 1

          // Get title for the dialog
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const itemTitle = itemTitleColumn ? String((item as any)[itemTitleColumn]) : ''

          return (
            <div className="flex items-center justify-center gap-1 px-2 whitespace-nowrap">
              <DataTableRowActions
                row={item}
                dict={dict}
                onEdit={onEdit}
                onDelete={onDelete}
                editForm={editForm}
                editFormProps={editFormProps}
                itemTitle={itemTitle}
                customActions={extraActions}
              />
            </div>
          )
        },
        size: 100,
        enableHiding: false,
      })
    }

    return cols
  }, [userColumns, onEdit, onDelete, customActions, dict, editForm, editFormProps, itemTitleColumn])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 px-2">
          {filterColumn && (
            <Input
              placeholder={searchPlaceholder || dict.common.table.search_placeholder}
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
              onChange={event => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
          )}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
                    <RotateCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
                    <span className="sr-only">{dict.common.actions.refresh}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{dict.common.actions.refresh}</TooltipContent>
              </Tooltip>
            )}
            <DataTableViewOptions table={table} dict={dict} />
            {CreateForm && (
              <Button onClick={onAddClick}>
                <Plus className="mr-2 h-4 w-4" />
                {dict.common.actions.create}
              </Button>
            )}
          </div>
        </div>
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border bg-card overflow-hidden">
          <div className="min-h-[530px]">
            {' '}
            {/* Height for approx 10 rows + header */}
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead
                          key={header.id}
                          className={`px-4 ${header.id === 'actions' ? 'w-0' : ''}`}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <DataTableRowSkeleton columnCount={columns.length} rowCount={10} />
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={cell.column.id === 'actions' ? 'w-0' : ''}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {dict.common.table.no_results}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {isLoading ? (
            <DataTableRowMobileCardSkeleton rowCount={table.getState().pagination.pageSize || 10} />
          ) : table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map(row => (
                <DataTableRowMobileCard
                  key={row.id}
                  row={row}
                  mobileTitleColumn={mobileTitleColumn}
                  mobileStatusColumn={mobileStatusColumn}
                  dict={dict}
                />
              ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground border rounded-md bg-card">
              {dict.common.table.no_results}
            </div>
          )}
        </div>
        <DataTablePagination table={table} dict={dict} />
      </div>
    </TooltipProvider>
  )
}
