'use client'

import * as React from 'react'
import { Edit, Trash2 } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
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
}

export function DataTableRowActions<TData>({
  row,
  dict,
  onEdit,
  onDelete,
  editForm: EditForm,
  editFormProps,
  itemTitle = '',
}: DataTableRowActionsProps<TData>) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const editDialogTitle = dict.common.dialogs.edit_dialog.title.replace('{item}', itemTitle)

  return (
    <div className="flex items-center justify-center gap-1">
      {/* EDIT ACTION */}
      {onEdit && EditForm && (
        <>
          {isDesktop ? (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <div className="inline-block">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{dict.common.actions.edit}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{dict.common.actions.edit}</TooltipContent>
                  </Tooltip>
                </div>
              </DialogTrigger>
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
              <DrawerTrigger asChild>
                <div className="inline-block">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">{dict.common.actions.edit}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{dict.common.actions.edit}</TooltipContent>
                  </Tooltip>
                </div>
              </DrawerTrigger>
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

      {/* DELETE ACTION */}
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="inline-block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">{dict.common.actions.delete}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{dict.common.actions.delete}</TooltipContent>
              </Tooltip>
            </div>
          </AlertDialogTrigger>
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
    </div>
  )
}
