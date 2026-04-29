import { getDictionary, hasLocale, type Locale } from '@/app/[lang]/dictionaries'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { TeamTableClient } from '@/components/table/team-table-client'
import { getTeamsData } from '@/lib/action/teams'

async function getTeamsPageData() {
  const teamsData = await getTeamsData()
  return teamsData
}

export default async function TeamsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    notFound()
  }

  const [dict, pageData] = await Promise.all([getDictionary(lang as Locale), getTeamsPageData()])

  if (!pageData) {
    notFound()
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: dict.general_form.breadcrumb_settings },
          { label: pageData.pageInfo?.title || '' },
        ]}
        title={pageData.pageInfo?.title || ''}
        description={pageData.pageInfo?.description || ''}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <TeamTableClient
          teams={pageData.data}
          dictDataTable={{
            common: {
              ...dict.common,
              notifications: dict.common.notifications,
            },
          }}
          dictTeamsPage={{
            table: dict.teams_page.table,
            notifications: dict.notifications.teams,
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
