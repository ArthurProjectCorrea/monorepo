import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { ScreensTableClient } from '@/components/tables/screen-table-client'
import { getScreenParametersData } from '@/lib/action/parameters'
import { cookies } from 'next/headers'
import { AUTH_SESSION_COOKIE, getScreenPermissions } from '@/lib/session'

export default async function ScreensPage({
  params,
}: {
  params: Promise<{ lang: string; domain: string }>
}) {
  const { lang, domain } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang as Locale)
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || ''

  const permissions = await getScreenPermissions(sessionId, 'screen_parameters')
  if (!permissions.view) {
    notFound()
  }

  const pageData = await getScreenParametersData()
  if (!pageData) {
    notFound()
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.common.breadcrumb.parameters },
          { label: pageData?.screen_screen_parameters?.title || '' },
        ]}
        title={pageData?.screen_screen_parameters?.title || ''}
        description={pageData?.screen_screen_parameters?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <ScreensTableClient
          screens={pageData.data}
          dict={dict.screen_parameters}
          common={dict.common}
          permissions={permissions}
        />
      </div>
    </>
  )
}
