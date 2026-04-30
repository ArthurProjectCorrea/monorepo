'use client'

import * as React from 'react'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { DataTableDict } from '@/types/data-table'
import { DataTableDialog } from './data-table-dialog'

interface DataTableRowActionsProps<TData> {
  row: TData
  dict: DataTableDict
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editForm?: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editFormProps?: Record<string, any>
  itemTitle?: string
  customActions?: {
    label: string
    icon: React.ReactNode
    onClick: (row: TData) => void
  }[]
}

export function DataTableRowActions<TData>({
  row,
  dict,
  onEdit,
  onDelete,
  editForm: EditForm,
  editFormProps,
  itemTitle = '',
  customActions = [],
}: DataTableRowActionsProps<TData>) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const editDialogTitle = dict.common.dialogs.edit_dialog.title.replace('{item}', itemTitle)

  const activeActionsCount = [onEdit, onDelete, ...customActions].filter(Boolean).length

  const renderActions = () => {
    // Mobile always groups everything into a single menu
    if (!isDesktop) {
      if (activeActionsCount === 0) return null

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{dict.common.table.actions_column}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem
                onClick={() => (EditForm ? setIsEditDialogOpen(true) : onEdit(row))}
              >
                <Edit className="mr-2 h-4 w-4" />
                {dict.common.actions.edit}
              </DropdownMenuItem>
            )}
            {customActions.map((action, i) => (
              <DropdownMenuItem key={i} onClick={() => action.onClick(row)}>
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </DropdownMenuItem>
            ))}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {dict.common.actions.delete}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Desktop: Edit and Delete are always visible. Custom actions are grouped if > 1.
    return (
      <div className="flex items-center gap-1">
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => (EditForm ? setIsEditDialogOpen(true) : onEdit(row))}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">{dict.common.actions.edit}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{dict.common.actions.edit}</TooltipContent>
          </Tooltip>
        )}

        {/* Custom Actions Grouping Logic */}
        {customActions.length === 1 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => customActions[0].onClick(row)}
              >
                {customActions[0].icon}
                <span className="sr-only">{customActions[0].label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{customActions[0].label}</TooltipContent>
          </Tooltip>
        ) : customActions.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {customActions.map((action, i) => (
                <DropdownMenuItem key={i} onClick={() => action.onClick(row)}>
                  <span className="mr-2">{action.icon}</span>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{dict.common.actions.delete}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{dict.common.actions.delete}</TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <>
      {renderActions()}

      {/* EDIT MODAL/DRAWER */}
      {onEdit && EditForm && (
        <DataTableDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title={editDialogTitle}
          description={dict.common.dialogs.edit_dialog.description}
          dict={dict}
        >
          <EditForm row={row} onSuccess={() => setIsEditDialogOpen(false)} {...editFormProps} />
        </DataTableDialog>
      )}

      {/* DELETE MODAL */}
      {onDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dict.common.dialogs.delete_confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {dict.common.dialogs.delete_confirm.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{dict.common.dialogs.delete_confirm.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(row)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {dict.common.dialogs.delete_confirm.confirm}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
