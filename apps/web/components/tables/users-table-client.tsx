'use client'

import { DataTable, type DataTableRowAction } from '@/components/custom/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/settings/users/columns'
import type { User } from '@/types/api'
import { useRouter, useParams } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'
import { deleteUserAction, resendResetPasswordAction } from '@/lib/action/settings'
import { notifyFromApi } from '@/lib/notifications'
import { Key } from 'lucide-react'
import type { Dictionary } from '@/types/i18n'

interface UsersTableClientProps {
  users: User[]
  dict: Dictionary['users']
  common: Dictionary['common']
  permissions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  isLoading?: boolean
}

export function UsersTableClient({
  users,
  dict,
  common,
  permissions,
  isLoading: externalLoading,
}: UsersTableClientProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()

  const columns = React.useMemo(() => getColumns(dict, common), [dict, common])

  const handleEdit = React.useCallback(
    (user: User) => {
      if (!permissions.update) return
      router.push(`/${params.lang}/${params.domain}/settings/users/${user.id}`)
    },
    [router, params, permissions.update],
  )

  const handleAdd = React.useCallback(() => {
    if (!permissions.create) return
    router.push(`/${params.lang}/${params.domain}/settings/users/new`)
  }, [router, params, permissions.create])

  const handleDelete = React.useCallback(
    async (user: User) => {
      if (!permissions.delete) return
      startTransition(async () => {
        try {
          const result = await deleteUserAction(user.id)
          notifyFromApi({
            httpStatus: result.httpStatus || (result.status === 'success' ? 200 : 500),
            dictionary: dict.notifications,
            commonDictionary: common.notifications,
            actionType: 'delete',
          })
        } catch {
          notifyFromApi({
            httpStatus: 500,
            dictionary: dict.notifications,
            commonDictionary: common.notifications,
          })
        }
      })
    },
    [dict.notifications, permissions.delete],
  )

  const handleResendReset = React.useCallback(
    async (user: User) => {
      startTransition(async () => {
        try {
          const result = await resendResetPasswordAction(user.id)
          if (result.status === 'success' && dict.notifications.success_resend_reset) {
            toast.success(dict.notifications.success_resend_reset)
          } else {
            notifyFromApi({
              httpStatus: result.httpStatus || 500,
              dictionary: dict.notifications,
              commonDictionary: common.notifications,
            })
          }
        } catch {
          notifyFromApi({
            httpStatus: 500,
            dictionary: dict.notifications,
            commonDictionary: common.notifications,
          })
        }
      })
    },
    [dict.notifications, common.notifications],
  )

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback(
    (): DataTableRowAction<User>[] => [
      {
        label: dict.table.actions.resend_reset,
        icon: <Key className="size-4" />,
        onClick: handleResendReset,
      },
    ],
    [dict.table.actions.resend_reset, handleResendReset],
  )

  return (
    <DataTable
      key="users-data-table"
      columns={columns}
      data={users}
      dict={{ common }}
      filterColumn="name"
      onEdit={permissions.update ? handleEdit : undefined}
      onDelete={permissions.delete ? handleDelete : undefined}
      onRefresh={handleRefresh}
      onAddClick={permissions.create ? handleAdd : undefined}
      isLoading={externalLoading || isPending}
      customActions={getCustomActions}
    />
  )
}
