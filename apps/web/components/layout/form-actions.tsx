'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, MoreVertical, Save, X, Undo2, ArrowLeft } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface FormActionsProps {
  onSave?: () => void
  onDiscard?: () => void
  onBack?: () => void
  isPending?: boolean
  saveLabel: string
  discardLabel: string
  backLabel?: string
  savingLabel?: string
  className?: string
}

export function FormActions({
  onSave,
  onDiscard,
  onBack,
  isPending,
  saveLabel,
  discardLabel,
  backLabel,
  savingLabel,
  className,
}: FormActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Close speed dial on escape or scroll
  React.useEffect(() => {
    const handleClose = () => setIsOpen(false)
    if (isOpen) {
      window.addEventListener('scroll', handleClose)
      return () => window.removeEventListener('scroll', handleClose)
    }
  }, [isOpen])

  return (
    <TooltipProvider>
      {/* Desktop View: Sticky Bottom Bar */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 hidden border-t bg-background/80 backdrop-blur-md transition-all duration-300 md:block md:left-[var(--sidebar-width,0px)]',
          className,
        )}
      >
        <div className="container flex h-16 items-center justify-end gap-4 px-4 md:px-8">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isPending}
              className="mr-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel || 'Voltar'}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            disabled={isPending}
            className="min-w-[100px]"
          >
            <Undo2 className="mr-2 h-4 w-4" />
            {discardLabel}
          </Button>
          <Button
            type="submit"
            onClick={onSave}
            disabled={isPending}
            className="min-w-[120px] shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {savingLabel || saveLabel}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {saveLabel}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile View: Speed Dial FAB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4 md:hidden">
        {/* Speed Dial Actions */}
        <div
          className={cn(
            'flex flex-col items-center gap-4 transition-all duration-300 origin-bottom',
            isOpen
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-50 opacity-0 translate-y-10 pointer-events-none',
          )}
        >
          {onBack && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full shadow-lg border bg-background"
                  onClick={() => {
                    onBack()
                    setIsOpen(false)
                  }}
                  disabled={isPending}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="font-medium">
                {backLabel || 'Voltar'}
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-12 w-12 rounded-full shadow-lg border-destructive/20 text-destructive bg-background hover:bg-destructive hover:text-destructive-foreground transition-colors"
                onClick={() => {
                  onDiscard?.()
                  setIsOpen(false)
                }}
                disabled={isPending}
              >
                <X className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-medium text-destructive">
              {discardLabel}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg shadow-primary/30"
                onClick={() => setIsOpen(false)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-medium">
              {saveLabel}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Trigger Button */}
        <Button
          type="button"
          size="icon"
          className={cn(
            'h-14 w-14 rounded-full shadow-2xl ring-4 ring-background transition-all duration-300',
            isOpen ? 'bg-muted text-muted-foreground rotate-45' : 'shadow-primary/40',
          )}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MoreVertical className="h-6 w-6" />
          )}
        </Button>

        {/* Backdrop for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 -z-10 bg-background/20 backdrop-blur-[2px] animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Spacer to avoid content being covered by the bar */}
      <div className="h-20 md:h-24 w-full" aria-hidden="true" />
    </TooltipProvider>
  )
}
