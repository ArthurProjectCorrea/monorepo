import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableLoadingProps {
  columnCount?: number
  rowCount?: number
}

/**
 * Skeleton for individual table rows.
 * Used for granular loading within the TableBody.
 */
export function DataTableRowSkeleton({ columnCount = 5, rowCount = 10 }: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className={i >= 5 ? 'hidden lg:table-row' : ''}>
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell key={j} className="p-4">
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Skeleton for individual mobile cards.
 * Used for granular loading within the mobile view.
 */
export function DataTableRowMobileCardSkeleton({ rowCount = 10 }: DataTableLoadingProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={i}
          className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 pb-3 border-b">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
          <div className="flex flex-col p-4 pt-3 gap-3">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

/**
 * Full page table skeleton including controls and pagination.
 * Used for initial page load fallback.
 */
export function DataTableLoading({ columnCount = 5, rowCount = 10 }: DataTableLoadingProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Search and Options Controls Skeleton */}
      <div className="flex items-center justify-between gap-2 px-2">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-9 w-[100px]" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block rounded-md border bg-card overflow-hidden">
        <div className="min-h-[280px] lg:min-h-[530px]">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columnCount }).map((_, i) => (
                  <TableHead key={i} className="px-4">
                    <Skeleton className="h-4 w-[80%]" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <DataTableRowSkeleton columnCount={columnCount} rowCount={rowCount} />
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card Skeleton */}
      <div className="block md:hidden space-y-4">
        <DataTableRowMobileCardSkeleton rowCount={rowCount} />
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-4 w-[200px]" />
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[70px]" />
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
