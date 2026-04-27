import { signOutAction } from '@/lib/action/sign-out'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/page-header'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Dashboard' }]}
        title="Dashboard"
        description="Welcome back. Here's an overview of your workspace."
      />

      <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-3xl border bg-background/60 p-8 text-center shadow-sm">
          <p className="max-w-md text-sm text-muted-foreground">
            You are authenticated and can access private routes.
          </p>
          <form action={signOutAction} className="mt-4">
            <Button variant="outline" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
