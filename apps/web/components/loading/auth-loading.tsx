import { Skeleton } from '@/components/ui/skeleton'

export function AuthLoading() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <Skeleton className="mx-auto h-8 w-[200px]" />
        <Skeleton className="mx-auto h-4 w-[280px]" />
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex flex-col space-y-2 text-center">
        <Skeleton className="mx-auto h-4 w-[150px]" />
      </div>
    </div>
  )
}
