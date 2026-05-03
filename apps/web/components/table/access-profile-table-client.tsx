'use client'

import { DataTable, type DataTableRowAction } from '@/components/data-table/data-table'
import { getColumns } from '@/app/[lang]/[domain]/settings/access-profiles/columns'
import type { DataTableDict } from '@/types/data-table'
import type { AccessProfile, AccessProfileFormDict } from '@/types/api'
import { useRouter, useParams } from 'next/navigation'
import * as React from 'react'
import { toast } from 'sonner'
import { deleteAccessProfileAction } from '@/lib/action/access-profiles'

interface AccessProfileTableClientProps {
  profiles: AccessProfile[]
  dictDataTable: DataTableDict
  dictProfilesPage: AccessProfileFormDict
  isLoading?: boolean
}

export function AccessProfileTableClient({
  profiles,
  dictDataTable,
  dictProfilesPage,
  isLoading: externalLoading,
}: AccessProfileTableClientProps) {
  const router = useRouter()
  const params = useParams()
  const [isPending, startTransition] = React.useTransition()

  const columns = React.useMemo(() => getColumns(dictProfilesPage), [dictProfilesPage])

  const handleEdit = React.useCallback(
    (profile: AccessProfile) => {
      router.push(`/${params.lang}/${params.domain}/settings/access-profiles/${profile.id}`)
    },
    [router, params],
  )

  const handleAdd = React.useCallback(() => {
    router.push(`/${params.lang}/${params.domain}/settings/access-profiles/new`)
  }, [router, params])

  const handleDelete = async (profile: AccessProfile) => {
    startTransition(async () => {
      try {
        const result = await deleteAccessProfileAction(profile.id)
        if (result.status === 'success') {
          toast.success(dictProfilesPage.notifications.success)
        } else {
          toast.error(dictProfilesPage.notifications.error)
        }
      } catch {
        toast.error(dictProfilesPage.notifications.error)
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
      dict={dictDataTable}
      filterColumn="name"
      searchPlaceholder={dictProfilesPage.table.column_name + '...'}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddClick={handleAdd}
      customActions={getCustomActions}
      itemTitleColumn="name"
      mobileTitleColumn="name"
      mobileStatusColumn="isActive"
      isLoading={externalLoading || isPending}
      onRefresh={handleRefresh}
    />
  )
}
