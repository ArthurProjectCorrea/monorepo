import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface BreadcrumbEntry {
  /** Visible label */
  label: string
  /** When provided the item becomes a link. Omit for the current page item. */
  href?: string
}

export interface PageHeaderProps {
  /** Breadcrumb trail. The last entry is always rendered as the current page. */
  breadcrumbs: [BreadcrumbEntry, ...BreadcrumbEntry[]]
  /** Main page heading */
  title: string
  /** Optional subtitle below the heading */
  description?: string
  /** Optional action buttons or elements to display on the right side of the header */
  actions?: React.ReactNode
}

/**
 * Shared header for every private page.
 * Renders the sidebar trigger, breadcrumb trail, and the page title/description.
 */
export function PageHeader({ breadcrumbs, title, description, actions }: PageHeaderProps) {
  const parents = breadcrumbs.slice(0, -1)
  const current = breadcrumbs[breadcrumbs.length - 1]

  return (
    <header className="flex shrink-0 flex-col transition-[width,height] ease-linear">
      {/* ── Top bar: sidebar trigger + breadcrumb ─────────────────── */}
      <div className="flex h-14 items-center gap-2 border-b px-2 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:h-16">
        <div className="flex min-w-0 items-center gap-2 px-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {parents.map((entry, i) => (
                <Fragment key={i}>
                  <BreadcrumbItem className="hidden md:block">
                    {entry.href ? (
                      <BreadcrumbLink href={entry.href}>{entry.label}</BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground">{entry.label}</span>
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </Fragment>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>{current.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* ── Page title + description ───────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
