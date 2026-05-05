import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { GeneralForm } from '@/components/forms/general-form'
import { getGeneralSettingsData } from '@/lib/action/settings'
import { cookies } from 'next/headers'
import { AUTH_SESSION_COOKIE } from '@/lib/session-constants'
import { getScreenPermissions } from '@/lib/session'

export default async function GeneralSettingsPage({
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

  const permissions = await getScreenPermissions(sessionId, 'general')
  if (!permissions.view) {
    notFound()
  }

  const clientData = await getGeneralSettingsData()
  if (!clientData) {
    notFound()
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.common.breadcrumb.settings },
          { label: clientData?.screen_general?.title || '' },
        ]}
        title={clientData?.screen_general?.title || ''}
        description={clientData?.screen_general?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <GeneralForm
          dict={dict.general}
          common={dict.common}
          dictUpload={dict.common.components.input_upload}
          lang={lang}
          initialData={{
            name: clientData.data.name,
            domain: clientData.data.domain,
            description: clientData.data.description,
            logo_url: clientData.data.logo_url,
          }}
          permissions={permissions}
        />
      </div>
    </>
  )
}
