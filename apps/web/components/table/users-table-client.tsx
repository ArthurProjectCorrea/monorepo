'use client'

import { DataTable, type DataTableRowAction } from '@/components/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/settings/users/columns'
import type { DataTableDict } from '@/types/data-table'
import type { User, UserFormDict } from '@/types/api'
import { useRouter, useParams } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'
import { deleteUserAction, resendResetAction } from '@/lib/action/users'

import { Key } from 'lucide-react'

interface UsersTableClientProps {
  users: User[]
  dictDataTable: DataTableDict
  dictUsersPage: UserFormDict
  isLoading?: boolean
}

export function UsersTableClient({
  users,
  dictDataTable,
  dictUsersPage,
  isLoading: externalLoading,
}: UsersTableClientProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()

  const columns = React.useMemo(() => getColumns(dictUsersPage), [dictUsersPage])

  const handleEdit = React.useCallback(
    (user: User) => {
      router.push(`/${params.lang}/${params.domain}/settings/users/${user.id}`)
    },
    [router, params],
  )

  const handleAdd = React.useCallback(() => {
    router.push(`/${params.lang}/${params.domain}/settings/users/new`)
  }, [router, params])

  const handleDelete = React.useCallback(
    async (user: User) => {
      startTransition(async () => {
        try {
          const result = await deleteUserAction(user.id)
          if (result.status === 'success') {
            toast.success(dictUsersPage.notifications.success)
          } else {
            toast.error(dictUsersPage.notifications.error)
          }
        } catch {
          toast.error(dictUsersPage.notifications.error)
        }
      })
    },
    [dictUsersPage.notifications.success, dictUsersPage.notifications.error],
  )

  const handleResendReset = React.useCallback(
    async (user: User) => {
      startTransition(async () => {
        try {
          const result = await resendResetAction(user.id)
          if (result.status === 'success') {
            toast.success(dictUsersPage.notifications.success)
          } else {
            toast.error(dictUsersPage.notifications.error)
          }
        } catch {
          toast.error(dictUsersPage.notifications.error)
        }
      })
    },
    [dictUsersPage.notifications.success, dictUsersPage.notifications.error],
  )

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback(
    (): DataTableRowAction<User>[] => [
      {
        label: dictUsersPage.common.actions.resend_reset,
        icon: <Key className="size-4" />,
        onClick: handleResendReset,
      },
    ],
    [dictUsersPage, handleResendReset],
  )

  return (
    <DataTable
      key="users-data-table"
      columns={columns}
      data={users}
      dict={dictDataTable}
      filterColumn="name"
      onEdit={handleEdit}
      onDelete={handleDelete}
      onRefresh={handleRefresh}
      onAddClick={handleAdd}
      isLoading={externalLoading || isPending}
      customActions={getCustomActions}
    />
  )
}
