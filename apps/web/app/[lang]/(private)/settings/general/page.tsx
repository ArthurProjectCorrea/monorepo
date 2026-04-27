import { GeneralForm } from '@/components/forms/general-form'
import { PageHeader } from '@/components/layout/page-header'
import { getDictionary, hasLocale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import screens from '@/data/screens.json'

export default async function GeneralSettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const dict = await getDictionary(lang)

  const { title, description } = screens.general

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: dict.general_form.breadcrumb_settings }, { label: title }]}
        title={title}
        description={description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <GeneralForm dict={dict.general_form} dictUpload={dict.input_upload} />
      </div>
    </>
  )
}
