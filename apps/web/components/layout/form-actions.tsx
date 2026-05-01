'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, Save, Undo2, ArrowLeft } from 'lucide-react'

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
  return (
    <>
      {/* Sticky Bottom Bar (Unified for Mobile & Desktop) */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-md transition-all duration-300 md:left-[var(--sidebar-width,0px)]',
          className,
        )}
      >
        <div className="container flex h-16 items-center justify-end gap-2 px-4 md:gap-4 md:px-8">
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              disabled={isPending}
              className="mr-auto h-10 w-10 p-0 md:h-10 md:w-auto md:px-4"
              title={backLabel || 'Voltar'}
            >
              <ArrowLeft className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
              <span className="hidden md:inline">{backLabel || 'Voltar'}</span>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onDiscard}
            disabled={isPending}
            className="h-10 w-10 p-0 md:h-10 md:w-auto md:min-w-[100px] md:px-4"
            title={discardLabel}
          >
            <Undo2 className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
            <span className="hidden md:inline">{discardLabel}</span>
          </Button>
          <Button
            type="submit"
            onClick={onSave}
            disabled={isPending}
            className="h-10 w-10 p-0 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] md:h-10 md:w-auto md:min-w-[120px] md:px-4"
            title={saveLabel}
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin md:mr-2 md:h-4 md:w-4" />
            ) : (
              <Save className="h-5 w-5 md:mr-2 md:h-4 md:w-4" />
            )}
            <span className="hidden md:inline">
              {isPending ? savingLabel || saveLabel : saveLabel}
            </span>
          </Button>
        </div>
      </div>

      {/* Spacer to avoid content being covered by the bar */}
      <div className="h-24 w-full shrink-0" aria-hidden="true" />
    </>
  )
}
