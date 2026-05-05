import { getDictionary, type Locale, defaultLocale } from '@/app/[lang]/dictionaries'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Forbidden({
  params,
}: {
  params?: Promise<{ lang: string; domain: string }>
}) {
  const resolvedParams = params ? await params : { lang: defaultLocale }
  const lang = (resolvedParams.lang as Locale) || defaultLocale
  const dict = await getDictionary(lang)

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Icon with glow effect */}
        <div className="group relative mb-10 transition-transform duration-500 hover:scale-110">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors" />
          <div className="relative flex items-center justify-center w-28 h-28 bg-background border border-border rounded-[2.5rem] shadow-2xl">
            <ShieldAlert
              className="w-14 h-14 text-primary animate-in zoom-in duration-700"
              strokeWidth={1.2}
            />
          </div>

          {/* Subtle ring animation */}
          <div className="absolute -inset-4 border border-primary/10 rounded-[3rem] animate-pulse pointer-events-none" />
        </div>

        {/* Text content */}
        <div className="space-y-4 mb-10">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent sm:text-6xl">
            403
          </h1>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            {dict.forbidden_page.title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {dict.forbidden_page.description}
          </p>
        </div>

        {/* Action button */}
        <Button
          asChild
          variant="default"
          size="lg"
          className="group relative h-14 px-10 rounded-2xl font-semibold overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/20 active:scale-95"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 w-5 h-5 transition-transform group-hover:-translate-x-1" />
            {dict.forbidden_page.back_button}
          </Link>
        </Button>

        {/* Status text */}
        <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
          Access Denied • Forbidden
        </p>
      </div>
    </div>
  )
}
