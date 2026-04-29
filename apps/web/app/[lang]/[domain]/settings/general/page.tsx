import { GeneralForm } from '@/components/forms/general-form'
import { PageHeader } from '@/components/layout/page-header'
import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { getClientData } from '@/lib/action/client'

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const [dict, clientData] = await Promise.all([getDictionary(lang as Locale), getClientData()])

  if (!clientData) {
    notFound()
  }

  const { title, description } = clientData.screen || {
    title: dict.general_form.breadcrumb_settings,
    description: '',
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: dict.general_form.breadcrumb_settings }, { label: title }]}
        title={title}
        description={description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <GeneralForm
          dict={{
            ...dict.general_form,
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
            },
          }}
          dictUpload={dict.input_upload}
          notificationsDict={dict.notifications.client_update}
          lang={lang}
          initialData={{
            name: clientData.client.name,
            domain: clientData.client.domain,
            description: clientData.client.description,
            logo_url: clientData.client.logo_url,
          }}
        />
      </div>
    </>
  )
}
