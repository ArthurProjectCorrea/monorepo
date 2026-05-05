'use client'

import { DataTable, type DataTableRowAction } from '@/components/custom/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/settings/access-profiles/columns'
import type { AccessProfile } from '@/types/api'
import { useRouter, useParams } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'
import { deleteAccessProfileAction } from '@/lib/action/settings'
import type { Dictionary } from '@/types/i18n'

interface AccessProfileTableClientProps {
  profiles: AccessProfile[]
  dict: Dictionary['access_profiles']
  common: Dictionary['common']
  permissions: {
    view: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  isLoading?: boolean
}

export function AccessProfileTableClient({
  profiles,
  dict,
  common,
  permissions,
  isLoading: externalLoading,
}: AccessProfileTableClientProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()

  const columns = React.useMemo(() => getColumns(dict, common), [dict, common])

  const handleEdit = React.useCallback(
    (profile: AccessProfile) => {
      if (!permissions.update) return
      router.push(`/${params.lang}/${params.domain}/settings/access-profiles/${profile.id}`)
    },
    [router, params, permissions.update],
  )

  const handleAdd = React.useCallback(() => {
    if (!permissions.create) return
    router.push(`/${params.lang}/${params.domain}/settings/access-profiles/new`)
  }, [router, params, permissions.create])

  const handleDelete = async (profile: AccessProfile) => {
    if (!permissions.delete) return
    startTransition(async () => {
      try {
        const result = await deleteAccessProfileAction(profile.id)
        if (result.status === 'success') {
          toast.success(common.notifications.success_delete)
        } else {
          toast.error(common.notifications.error)
        }
      } catch {
        toast.error(common.notifications.error)
      }
    })
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const getCustomActions = React.useCallback((): DataTableRowAction<AccessProfile>[] => [], [])

  return (
    <DataTable
      key="access-profiles-data-table"
      columns={columns}
      data={profiles}
      dict={{ common }}
      filterColumn="name"
      searchPlaceholder={dict.table.column_name + '...'}
      onEdit={permissions.update ? handleEdit : undefined}
      onDelete={permissions.delete ? handleDelete : undefined}
      onAddClick={permissions.create ? handleAdd : undefined}
      customActions={getCustomActions}
      itemTitleColumn="name"
      mobileTitleColumn="name"
      mobileStatusColumn="isActive"
      isLoading={externalLoading || isPending}
      onRefresh={handleRefresh}
    />
  )
}
