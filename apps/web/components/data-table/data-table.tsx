'use client'

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
import type { DataTableDict } from '@/types/data-table'

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
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DataTable<TData, TValue>({
  columns: userColumns,
  data,
  dict,
  filterColumn,
  searchPlaceholder,
  onEdit,
  onDelete,
  customActions,
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
        header: () => <div className="px-2 text-center">{dict.actions}</div>,
        cell: ({ row }) => {
          const item = row.original
          const extraActions = customActions ? customActions(item) : []
          const hasManyCustom = extraActions.length > 1

          return (
            <div className="flex items-center justify-center gap-1 px-2 whitespace-nowrap">
              <TooltipProvider>
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{dict.action_edit}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{dict.action_edit}</TooltipContent>
                  </Tooltip>
                )}

                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{dict.action_delete}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{dict.action_delete}</TooltipContent>
                  </Tooltip>
                )}

                {!hasManyCustom &&
                  extraActions.map((action, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => action.onClick(item)}
                        >
                          {action.icon}
                          <span className="sr-only">{action.label}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{action.label}</TooltipContent>
                    </Tooltip>
                  ))}

                {hasManyCustom && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{dict.actions}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {extraActions.map((action, i) => (
                        <DropdownMenuItem key={i} onClick={() => action.onClick(item)}>
                          <span className="mr-2">{action.icon}</span>
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TooltipProvider>
            </div>
          )
        },
        size: 100, // Fixed width suggestion
        enableHiding: false,
      })
    }

    return cols
  }, [userColumns, onEdit, onDelete, customActions, dict])

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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {filterColumn && (
          <Input
            placeholder={searchPlaceholder || dict.search_placeholder}
            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
            onChange={event => table.getColumn(filterColumn)?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        )}
        <DataTableViewOptions table={table} dict={dict} />
      </div>
      <div className="rounded-md border bg-card">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'w-0' : ''}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {dict.no_results}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} dict={dict} />
    </div>
  )
}
