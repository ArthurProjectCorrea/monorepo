import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { ScreensTableClient } from '../../../../../components/table/screens-table-client'
import type { Screen } from './columns'
import screensData from '@/data/screens.json'

async function getScreensPageData(): Promise<{
  screen: { title: string; description: string; screenKey: string }
  data: Screen[]
} | null> {
  // Simulating API call response structure
  return screensData as {
    screen: { title: string; description: string; screenKey: string }
    data: Screen[]
  }
}

export default async function ScreensPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const [dict, pageData] = await Promise.all([getDictionary(lang as Locale), getScreensPageData()])

  if (!pageData) {
    notFound()
  }

  const { title, description } = pageData.screen

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: dict.general_form.breadcrumb_parameters }, { label: title }]}
        title={title}
        description={description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <ScreensTableClient
          screens={pageData.data}
          dictDataTable={dict.data_table}
          dictScreensPage={dict.screens_page}
        />
      </div>
    </>
  )
}
