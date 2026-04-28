import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { getDictionary, type Locale } from '@/app/[lang]/dictionaries'

export default async function PrivateLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang as Locale)

  return (
    <SidebarProvider>
      <AppSidebar lang={lang} dict={dict} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
