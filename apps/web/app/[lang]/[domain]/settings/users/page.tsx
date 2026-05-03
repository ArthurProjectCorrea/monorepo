import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { UsersTableClient } from '@/components/table/users-table-client'
import { getUsersData } from '@/lib/action/users'

export default async function UsersPage({
  params,
}: {
  params: Promise<{ lang: string; domain: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dict = (await getDictionary(lang as Locale)) as any

  const pageData = await getUsersData()
  const users = pageData?.data || []

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.general_form.breadcrumb_settings },
          { label: dict.sidebar.nav_main.users },
        ]}
        title={pageData?.pageInfo?.title || dict.users_page.title}
        description={pageData?.pageInfo?.description || dict.users_page.description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <UsersTableClient
          users={users}
          dictDataTable={{
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
            },
          }}
          dictUsersPage={{
            table: {
              ...dict.users_page.table,
              column_status: dict.common.table.column_status,
              column_updated_at: dict.common.table.column_updated_at,
              column_created_at: dict.common.table.column_created_at,
              no_results: dict.common.table.no_results,
            },
            notifications: dict.notifications.users,
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
              table: dict.common.table,
            },
            sidebar: dict.sidebar,
          }}
        />
      </div>
    </>
  )
}
