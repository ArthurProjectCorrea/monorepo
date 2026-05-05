import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { AccessProfileTableClient } from '@/components/tables/access-profile-table-client'
import { getAccessProfilesData } from '@/lib/action/settings'
import { cookies } from 'next/headers'
import { AUTH_SESSION_COOKIE } from '@/lib/session-constants'
import { getScreenPermissions } from '@/lib/session'

export default async function AccessProfilesPage({
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

  const permissions = await getScreenPermissions(sessionId, 'access_profiles')
  if (!permissions.view) {
    notFound()
  }

  const pageData = await getAccessProfilesData()
  const profiles = pageData?.data || []

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.common.breadcrumb.settings },
          { label: pageData?.screen_access_profiles?.title || '' },
        ]}
        title={pageData?.screen_access_profiles?.title || ''}
        description={pageData?.screen_access_profiles?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <AccessProfileTableClient
          profiles={profiles}
          dict={dict.access_profiles}
          common={dict.common}
          permissions={permissions}
        />
      </div>
    </>
  )
}
