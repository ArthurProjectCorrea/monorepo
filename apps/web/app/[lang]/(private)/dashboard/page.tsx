export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-3xl border bg-background/60 p-8 text-center shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You are authenticated and can access private routes.
      </p>
    </div>
  )
}
