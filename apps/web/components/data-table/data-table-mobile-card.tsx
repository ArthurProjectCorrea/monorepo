import * as React from 'react'
import { Row, flexRender } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DataTableDict } from '@/types/data-table'

interface DataTableRowMobileCardProps<TData> {
  row: Row<TData>
  mobileTitleColumn?: string
  mobileStatusColumn?: string
  dict: DataTableDict
}

export function DataTableRowMobileCard<TData>({
  row,
  mobileTitleColumn,
  mobileStatusColumn,
  dict,
}: DataTableRowMobileCardProps<TData>) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Find header cells
  const titleCell = mobileTitleColumn
    ? row.getVisibleCells().find(cell => cell.column.id === mobileTitleColumn)
    : null
  const statusCell = mobileStatusColumn
    ? row.getVisibleCells().find(cell => cell.column.id === mobileStatusColumn)
    : null
  const actionsCell = row.getVisibleCells().find(cell => cell.column.id === 'actions')

  // Filter out header cells for the body
  const bodyCells = row.getVisibleCells().filter(cell => {
    return (
      cell.column.id !== 'actions' &&
      cell.column.id !== mobileTitleColumn &&
      cell.column.id !== mobileStatusColumn
    )
  })

  const visibleBodyCells = isExpanded ? bodyCells : bodyCells.slice(0, 4)
  const hasMoreCells = bodyCells.length > 4

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="flex items-center justify-between p-4 pb-3 border-b">
        <div className="flex flex-col gap-1 pr-4 truncate">
          {titleCell && (
            <div className="font-semibold text-base truncate">
              <span className="text-muted-foreground mr-1 font-normal text-sm">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(titleCell.column.columnDef.meta as any)?.title || titleCell.column.id}:
              </span>
              {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusCell && (
            <div>{flexRender(statusCell.column.columnDef.cell, statusCell.getContext())}</div>
          )}
          {actionsCell && (
            <div>{flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}</div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col p-4 pt-3 gap-3">
        {visibleBodyCells.map(cell => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const title = (cell.column.columnDef.meta as any)?.title || cell.column.id
          return (
            <div
              key={cell.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b pb-2 last:border-0 last:pb-0"
            >
              <span className="text-sm text-muted-foreground">{title}</span>
              <div className="text-sm font-medium sm:text-right break-words overflow-hidden">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          )
        })}
      </div>

      {/* Card Footer (Expand/Collapse) */}
      {hasMoreCells && (
        <div className="border-t p-2 flex justify-center bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {isExpanded ? (
              <>
                {dict.common.actions.view_less}
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                {dict.common.actions.view_more}
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
