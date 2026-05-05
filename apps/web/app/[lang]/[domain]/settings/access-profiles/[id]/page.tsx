import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import type { Dictionary } from '@/types/i18n'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { AccessProfileForm } from '@/components/forms/access-profile-form'
import { getAccessProfileByIdData } from '@/lib/action/settings'
import { fetchScreensData } from '@/lib/action/settings'
import { cookies } from 'next/headers'
import { AUTH_SESSION_COOKIE, getScreenPermissions } from '@/lib/session'

export default async function EditAccessProfilePage({
  params,
}: {
  params: Promise<{ lang: string; domain: string; id: string }>
}) {
  const { lang, domain, id } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = (await getDictionary(lang as Locale)) as Dictionary
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || ''

  const permissions = await getScreenPermissions(sessionId, 'access_profiles')
  if (!permissions.view || !permissions.update) {
    notFound()
  }

  const profilePromise = getAccessProfileByIdData(id)
  const screensPromise = fetchScreensData()

  const [profile, screensData] = await Promise.all([profilePromise, screensPromise])

  if (!profile || !screensData) {
    notFound()
  }

  const screens = screensData.data.map(s => ({ id: s.id, title: s.title }))
  const moduleScreen = screensData.data.find(s => s.screenKey === 'access_profiles')

  const actions = [
    { id: 'view', name: dict.access_profiles.form.table_permissions.permission_view },
    { id: 'create', name: dict.access_profiles.form.table_permissions.permission_create },
    { id: 'update', name: dict.access_profiles.form.table_permissions.permission_update },
    { id: 'delete', name: dict.access_profiles.form.table_permissions.permission_delete },
  ]

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.common.breadcrumb.settings },
          {
            label: moduleScreen?.title || '',
            href: `/${lang}/${domain}/settings/access-profiles`,
          },
          { label: profile.name },
        ]}
        title={dict.common.table.actions.update + ': ' + profile.name}
        description={moduleScreen?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <AccessProfileForm
          initialData={profile}
          dict={dict.access_profiles}
          common={dict.common}
          screens={screens}
          actions={actions}
        />
      </div>
    </>
  )
}
