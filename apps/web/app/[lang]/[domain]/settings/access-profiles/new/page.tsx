import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { AccessProfileForm } from '@/components/forms/access-profile-form'

export default async function NewAccessProfilePage({
  params,
}: {
  params: Promise<{ lang: string; domain: string }>
}) {
  const { lang, domain } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dict = (await getDictionary(lang as Locale)) as any

  const mockScreens = [
    { id: 'teams', title: 'Equipes' },
    { id: 'screen_parameters', title: 'Parâmetros de Telas' },
    { id: 'general', title: 'Geral' },
    { id: 'access_profiles', title: 'Perfil de Acesso' },
  ]

  const mockActions = [
    { id: 'view', name: dict.access_profiles_page.table.form.permission_view },
    { id: 'create', name: dict.access_profiles_page.table.form.permission_create },
    { id: 'update', name: dict.access_profiles_page.table.form.permission_update },
    { id: 'delete', name: dict.access_profiles_page.table.form.permission_delete },
  ]

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.general_form.breadcrumb_settings },
          {
            label: dict.sidebar.nav_main.access_profiles,
            href: `/${lang}/${domain}/settings/access-profiles`,
          },
          { label: dict.common.actions.create },
        ]}
        title={dict.common.actions.create + ' ' + dict.sidebar.nav_main.access_profiles}
        description={dict.access_profiles_page.description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <AccessProfileForm
          dict={{
            table: {
              ...dict.access_profiles_page.table,
              column_status: dict.common.table.column_status,
              column_updated_at: dict.common.table.column_updated_at,
              column_created_at: dict.common.table.column_created_at,
            },
            notifications: dict.notifications.access_profiles,
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
              table: dict.common.table,
            },
            screens_page: dict.screens_page,
            sidebar: dict.sidebar,
          }}
          screens={mockScreens}
          actions={mockActions}
        />
      </div>
    </>
  )
}
