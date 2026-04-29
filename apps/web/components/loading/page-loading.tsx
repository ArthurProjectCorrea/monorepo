import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export function PageLoading() {
  return (
    <div className="flex flex-1 flex-col h-full w-full">
      {/* Page Header Skeleton Shadow */}
      <header className="flex shrink-0 flex-col transition-[width,height] ease-linear">
        {/* Top bar shadow: sidebar trigger + breadcrumb */}
        <div className="flex h-14 items-center gap-2 border-b px-2 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:h-16">
          <div className="flex min-w-0 items-center gap-2 px-2">
            <Skeleton className="h-7 w-7 rounded-md" /> {/* Sidebar Trigger placeholder */}
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20 hidden md:block" /> {/* Breadcrumb parent */}
              <div className="h-4 w-4 hidden md:block">
                <Skeleton className="h-full w-full rounded-full" /> {/* Separator dot */}
              </div>
              <Skeleton className="h-4 w-24" /> {/* Current page breadcrumb */}
            </div>
          </div>
        </div>

        {/* Page title + description shadow */}
        <div className="px-4 py-4 md:px-6 space-y-1">
          <Skeleton className="h-7 w-[250px] md:h-8" /> {/* Title placeholder */}
          <Skeleton className="h-4 w-[350px] max-w-full" /> {/* Description placeholder */}
        </div>
      </header>

      {/* Page Content Skeleton (generic container) */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 md:gap-6 md:p-6 md:pt-0">
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  )
}
