import { Typewriter } from '@/components/animations/typewriter'
import { ThemeToggle } from '@/components/theme-toggle'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { AuthDrawer } from '@/components/drawer/auth-drawer'
import { getDictionary, hasLocale, Locale } from '@/app/[lang]/dictionaries'
import Link from 'next/link'
import Image from 'next/image'

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) {
    return null
  }

  const dict = await getDictionary(lang as Locale)

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Side 1: Content/Form */}
      <div className="flex flex-col bg-background relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between p-6 w-full">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/next.svg"
              alt="Logo"
              width={100}
              height={24}
              className="h-auto dark:invert transition-transform group-hover:scale-105"
            />
          </Link>
          <div className="flex items-center gap-4">
            <LocaleSwitcher dict={dict.locale_switcher} />
            <ThemeToggle dict={dict.theme_toggle} variant="toggle" />
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60 w-full">
          <p>
            {dict.footer.rights
              .replace('{year}', new Date().getFullYear().toString())
              .replace('{name}', process.env.NEXT_PUBLIC_APP_NAME || '')}
          </p>
          <div className="flex items-center gap-6">
            <AuthDrawer
              triggerText={dict.footer.privacy_terms}
              title={dict.footer.privacy_terms}
              content={dict.footer.privacy_content}
              closeText={dict.footer.close}
            />
            <AuthDrawer
              triggerText={dict.footer.system_policies}
              title={dict.footer.system_policies}
              content={dict.footer.policies_content}
              closeText={dict.footer.close}
            />
          </div>
        </footer>
      </div>

      {/* Side 2: Visual/Gradient */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden">
        {/* Dynamic Gradient Background using theme tokens */}
        <div className="absolute inset-0 bg-zinc-950">
          <div className="absolute inset-0 opacity-90 bg-gradient-to-br from-primary via-muted to-secondary" />

          {/* Animated Mesh Gradients for depth */}
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/10 blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-black/20 blur-[100px] animate-pulse" />
        </div>

        {/* Typewriter Animation */}
        <div className="relative z-10 p-12 text-center w-full max-w-2xl">
          <Typewriter phrases={Object.values(dict.auth.typewriter_phrases) as string[]} />
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-[0.1] mask-[radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>
    </div>
  )
}
