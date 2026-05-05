import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { TeamTableClient } from '@/components/tables/team-table-client'
import { getTeamsData } from '@/lib/action/settings'
import { cookies } from 'next/headers'
import { AUTH_SESSION_COOKIE } from '@/lib/session-constants'
import { getScreenPermissions } from '@/lib/session'

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ lang: string; domain: string }>
}) {
  const { lang, domain } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = (await getDictionary(lang as Locale)) as Dictionary
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || ''

  const permissions = await getScreenPermissions(sessionId, 'teams')
  if (!permissions.view) {
    notFound()
  }

  const pageData = await getTeamsData()
  const teams = pageData?.data || []

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.common.breadcrumb.settings },
          { label: pageData?.screen_teams?.title || '' },
        ]}
        title={pageData?.screen_teams?.title || ''}
        description={pageData?.screen_teams?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <TeamTableClient
          teams={teams}
          dict={dict.teams}
          common={dict.common}
          permissions={permissions}
        />
      </div>
    </>
  )
}
