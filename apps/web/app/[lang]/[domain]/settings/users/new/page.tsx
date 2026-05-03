import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { UserForm } from '@/components/forms/user-form'
import { getTeamsData } from '@/lib/action/teams'
import { getAccessProfilesData } from '@/lib/action/access-profiles'
import usersScreenData from '@/data/users-screen.json'

export default async function NewUserPage({
  params,
}: {
  params: Promise<{ lang: string; domain: string }>
}) {
  const { lang, domain } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const [dict, teamsResponse, profilesResponse] = await Promise.all([
    getDictionary(lang as Locale),
    getTeamsData(),
    getAccessProfilesData(),
  ])

  const teams = teamsResponse?.data || []
  const accessProfiles = profilesResponse?.data || []

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.general_form.breadcrumb_settings },
          {
            label: dict.sidebar.nav_main.users,
            href: `/${lang}/${domain}/settings/users`,
          },
          { label: dict.common.actions.create },
        ]}
        title={dict.common.actions.create + ' ' + dict.sidebar.nav_main.users}
        description={usersScreenData.pageInfo.description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <UserForm
          dict={{
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
          teams={teams}
          accessProfiles={accessProfiles}
        />
      </div>
    </>
  )
}
