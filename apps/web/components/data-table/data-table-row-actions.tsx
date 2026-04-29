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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { DataTableDict } from '@/types/data-table'

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
  const useMenu = !isDesktop || activeActionsCount > 1

  const renderActions = () => {
    if (useMenu) {
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
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
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

    return (
      <div className="flex items-center gap-1">
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">{dict.common.actions.edit}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{dict.common.actions.edit}</TooltipContent>
          </Tooltip>
        )}
        {customActions.map((action, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => action.onClick(row)}
              >
                {action.icon}
                <span className="sr-only">{action.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        ))}
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
        <>
          {isDesktop ? (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editDialogTitle}</DialogTitle>
                  <DialogDescription>
                    {dict.common.dialogs.edit_dialog.description}
                  </DialogDescription>
                </DialogHeader>
                <EditForm
                  row={row}
                  onSuccess={() => setIsEditDialogOpen(false)}
                  {...editFormProps}
                />
              </DialogContent>
            </Dialog>
          ) : (
            <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle>{editDialogTitle}</DrawerTitle>
                  <DrawerDescription>
                    {dict.common.dialogs.edit_dialog.description}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-4">
                  <EditForm
                    row={row}
                    onSuccess={() => setIsEditDialogOpen(false)}
                    {...editFormProps}
                  />
                </div>
                <DrawerFooter className="pt-2">
                  <DrawerClose asChild>
                    <Button variant="outline">{dict.common.dialogs.edit_dialog.cancel}</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
        </>
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
