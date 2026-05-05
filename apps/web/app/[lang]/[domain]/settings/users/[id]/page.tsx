import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { UserForm } from '@/components/forms/user-form'
import {
  getTeamsData,
  getAccessProfilesData,
  getUserByIdData,
  getUsersData,
} from '@/lib/action/settings'
import { cookies } from 'next/headers'
import { AUTH_SESSION_COOKIE, getScreenPermissions } from '@/lib/session'

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ lang: string; domain: string; id: string }>
}) {
  const { lang, domain, id } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang as Locale)
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || ''

  const permissions = await getScreenPermissions(sessionId, 'users')
  if (!permissions.view || !permissions.update) {
    notFound()
  }

  const [pageData, user, teamsResponse, profilesResponse] = await Promise.all([
    getUsersData(),
    getUserByIdData(id),
    getTeamsData(),
    getAccessProfilesData(),
  ])

  const teams = teamsResponse?.data || []
  const accessProfiles = profilesResponse?.data || []

  if (!user) {
    notFound()
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.common.breadcrumb.settings },
          {
            label: pageData?.screen_users?.title || '',
            href: `/${lang}/${domain}/settings/users`,
          },
          { label: user.name },
        ]}
        title={dict.common.table.actions.update + ': ' + user.name}
        description={pageData?.screen_users?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <UserForm
          initialData={user}
          dict={dict.users}
          common={dict.common}
          teams={teams}
          accessProfiles={accessProfiles}
        />
      </div>
    </>
  )
}
