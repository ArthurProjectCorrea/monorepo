'use client'

import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Table } from '@tanstack/react-table'
import { Columns2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type { DataTableDict } from '@/types/data-table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
  dict: DataTableDict
}

export function DataTableViewOptions<TData>({ table, dict }: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hidden md:flex">
                <Columns2 className="h-4 w-4" />
                <span className="sr-only">{dict.common.table.columns_button}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{dict.common.table.columns_button}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>{dict.common.table.columns_button}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
          .map(column => {
            // Extract title from column meta or ID
            const title = (column.columnDef.meta as Record<string, string>)?.title || column.id

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={value => column.toggleVisibility(!!value)}
              >
                {title}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
