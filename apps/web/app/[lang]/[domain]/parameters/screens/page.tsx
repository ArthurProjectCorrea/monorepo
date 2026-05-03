import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { ScreensTableClient } from '../../../../../components/table/screen-table-client'

import { fetchScreensData } from '@/lib/action/settings'

async function getScreensPageData() {
  const screensData = await fetchScreensData()
  return screensData
}

export default async function ScreensPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const [dict, pageData] = await Promise.all([getDictionary(lang as Locale), getScreensPageData()])

  if (!pageData || !pageData.screen) {
    notFound()
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.general_form.breadcrumb_parameters },
          { label: pageData.screen.title },
        ]}
        title={pageData.screen.title}
        description={pageData.screen.description}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <ScreensTableClient
          screens={pageData.data}
          dictDataTable={{
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
            },
          }}
          dictScreensPage={{
            table: {
              ...dict.screens_page.table,
              column_status: dict.common.table.column_status,
              column_updated_at: dict.common.table.column_updated_at,
            },
            notifications: dict.notifications.screens,
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
              table: dict.common.table,
            },
          }}
        />
      </div>
    </>
  )
}
