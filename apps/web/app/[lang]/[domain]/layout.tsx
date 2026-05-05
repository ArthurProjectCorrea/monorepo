import { AppSidebar } from '@/components/custom/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { cookies } from 'next/headers'
import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'
import { getSidebarData } from '@/lib/sidebar'
import { AUTH_SESSION_COOKIE } from '@/lib/session-constants'

export default async function PrivateLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string; domain: string }>
}) {
  const { lang, domain } = await params
  const dict = await getDictionary(lang as Locale)
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(AUTH_SESSION_COOKIE)?.value || ''

  const sidebarData = await getSidebarData(domain, dict, sessionId)

  return (
    <SidebarProvider>
      <AppSidebar sidebarData={sidebarData} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
