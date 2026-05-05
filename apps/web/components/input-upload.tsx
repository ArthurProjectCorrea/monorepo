'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { UploadCloudIcon, FileIcon, XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadedFile {
  file: File
  previewUrl: string | null // null when not an image
}

/** Subset of the dictionary shape expected by this component. */
export interface InputUploadDict {
  title: string
  title_dragging: string
  description_single: string
  description_multiple: string
  browse: string
  aria_label: string
  aria_upload_area: string
  aria_remove: string
  replace: string
  remove: string
  error_max_files: string
  error_max_files_plural: string
  error_size: string
  error_size_plural: string
}

export interface InputUploadProps {
  /** Translated strings. Falls back to built-in English defaults when omitted. */
  dict?: InputUploadDict
  /** MIME types or extensions accepted, same syntax as <input accept="…"> */
  accept?: string
  /** Maximum individual file size in bytes. Default: 5 MB */
  maxSize?: number
  /** Maximum number of files allowed. Default: 1 */
  maxFiles?: number
  /** Called whenever the file list changes */
  onChange?: (files: UploadedFile[]) => void
  initialUrl?: string
  name?: string
  className?: string
  disabled?: boolean
}

// ─── Built-in English fallback ────────────────────────────────────────────────

const defaultDict: InputUploadDict = {
  title: 'Upload file',
  title_dragging: 'Drop your file here',
  description_single: 'Max {maxSize}',
  description_multiple: 'Up to {maxFiles} files · max {maxSize} each',
  browse: 'Browse files',
  aria_label: 'File upload',
  aria_upload_area: 'Upload area',
  aria_remove: 'Remove {name}',
  replace: 'Replace',
  remove: 'Remove',
  error_max_files: 'Maximum of {maxFiles} file reached.',
  error_max_files_plural: 'Maximum of {maxFiles} files reached.',
  error_size: 'File exceeds the {maxSize} limit.',
  error_size_plural: 'Files exceed the {maxSize} limit.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isImage(file: File) {
  return file.type.startsWith('image/')
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`
}

/** Replace {token} placeholders in a template string. */
function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InputUpload({
  dict,
  accept,
  maxSize = 5 * 1024 * 1024,
  maxFiles = 1,
  onChange,
  initialUrl,
  name,
  className,
  disabled,
}: InputUploadProps) {
  const t = useMemo(() => ({ ...defaultDict, ...dict }), [dict])

  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInitial, setShowInitial] = useState(!!initialUrl)

  const isMultiple = maxFiles > 1

  // ── Process raw File objects ──────────────────────────────────────────────
  const processFiles = useCallback(
    async (incoming: File[], replaceIndex?: number) => {
      setError(null)

      if (replaceIndex === undefined) {
        const remaining = maxFiles - files.length
        if (remaining <= 0) {
          const key = maxFiles > 1 ? 'error_max_files_plural' : 'error_max_files'
          setError(interpolate(t[key], { maxFiles }))
          return
        }
      }

      const candidates =
        replaceIndex !== undefined ? [incoming[0]] : incoming.slice(0, maxFiles - files.length)

      const oversized = candidates.filter(f => f.size > maxSize)
      if (oversized.length) {
        const key = oversized.length > 1 ? 'error_size_plural' : 'error_size'
        setError(interpolate(t[key], { maxSize: formatBytes(maxSize) }))
        return
      }

      const next: UploadedFile[] = await Promise.all(
        candidates.map(async file => ({
          file,
          previewUrl: isImage(file) ? await readAsDataURL(file) : null,
        })),
      )

      let updated: UploadedFile[]
      if (replaceIndex !== undefined) {
        updated = [...files]
        updated[replaceIndex] = next[0]
      } else {
        updated = [...files, ...next]
      }

      setFiles(updated)
      setShowInitial(false)
      onChange?.(updated)
    },
    [files, maxFiles, maxSize, onChange, t],
  )

  // ── Remove a single file ──────────────────────────────────────────────────
  const remove = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index)
      setFiles(updated)
      setShowInitial(false)
      onChange?.(updated)
      setError(null)
      if (inputRef.current) inputRef.current.value = ''
    },
    [files, onChange],
  )

  // ── Native input change ───────────────────────────────────────────────────
  const [replaceIdx, setReplaceIdx] = useState<number | undefined>(undefined)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(Array.from(e.target.files), replaceIdx)
        setReplaceIdx(undefined)
      }
    },
    [processFiles, replaceIdx],
  )

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files))
    },
    [processFiles],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasFiles = files.length > 0
  const isFull = files.length >= maxFiles

  // ─── Description string ───────────────────────────────────────────────────
  const descriptionText = interpolate(isMultiple ? t.description_multiple : t.description_single, {
    maxFiles,
    maxSize: formatBytes(maxSize),
  })

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={isMultiple}
        className="sr-only"
        onChange={handleInputChange}
        aria-label={t.aria_label}
      />

      {/* ── Drop zone / preview area ─────────────────────────────────── */}
      {!hasFiles && !showInitial ? (
        /* Empty state — click or drag to upload */
        <Empty
          role="button"
          tabIndex={0}
          aria-label={t.aria_upload_area}
          className={cn(
            'group cursor-pointer border border-dashed transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.02]',
            isDragging && !disabled && 'border-primary bg-primary/[0.05]',
            disabled && 'cursor-not-allowed opacity-60 bg-muted/50',
          )}
          onDrop={!disabled ? handleDrop : undefined}
          onDragOver={!disabled ? handleDragOver : undefined}
          onDragLeave={!disabled ? handleDragLeave : undefined}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={e => !disabled && e.key === 'Enter' && inputRef.current?.click()}
        >
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="transition-transform duration-200 group-hover:scale-110"
            >
              <UploadCloudIcon className="text-muted-foreground transition-colors group-hover:text-primary" />
            </EmptyMedia>
            <EmptyTitle>{isDragging ? t.title_dragging : t.title}</EmptyTitle>
            <EmptyDescription>
              {descriptionText}
              {accept && (
                <span className="mt-1 block text-[10px] uppercase tracking-wider opacity-70">
                  {accept.split(',').join(' • ')}
                </span>
              )}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="shadow-sm"
              onClick={e => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              disabled={disabled}
            >
              {t.browse}
            </Button>
          </EmptyContent>
        </Empty>
      ) : isMultiple ? (
        /* ── Multi-file grid ───────────────────────────────────────────── */
        <div
          className={cn(
            'rounded-xl border border-dashed p-4 transition-colors',
            isDragging && 'border-primary bg-primary/5',
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((f, i) => (
              <FilePreviewCard
                key={i}
                uploaded={f}
                onRemove={() => remove(i)}
                ariaRemove={interpolate(t.aria_remove, { name: f.file.name })}
              />
            ))}

            {/* Add-more cell */}
            {!isFull && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square items-center justify-center rounded-xl border border-dashed text-muted-foreground transition-all hover:border-primary hover:bg-primary/[0.02] hover:text-primary"
              >
                <UploadCloudIcon className="size-6" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Single file preview (full width) ─────────────────────────── */
        <SingleFilePreview
          uploaded={files[0] || { file: new File([], 'Logo'), previewUrl: initialUrl || '' }}
          onRemove={() => {
            if (files.length > 0) remove(0)
            else setShowInitial(false)
          }}
          onReplace={() => {
            setReplaceIdx(0)
            inputRef.current?.click()
          }}
          labelReplace={t.replace}
          labelRemove={t.remove}
          disabled={disabled}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FilePreviewCard({
  uploaded,
  onRemove,
  ariaRemove,
}: {
  uploaded: UploadedFile
  onRemove: () => void
  ariaRemove: string
}) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border bg-muted shadow-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      {uploaded.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={uploaded.previewUrl}
          alt={uploaded.file.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-muted-foreground">
          <FileIcon className="size-8" />
          <span className="line-clamp-2 text-[10px] font-medium leading-tight">
            {uploaded.file.name}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-lg ring-1 ring-white/20 transition-all hover:scale-110 active:scale-95 group-hover:opacity-100"
        aria-label={ariaRemove}
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}

function SingleFilePreview({
  uploaded,
  onRemove,
  onReplace,
  labelReplace,
  labelRemove,
  disabled,
}: {
  uploaded: { file: { name: string; size?: number }; previewUrl: string }
  onRemove: () => void
  onReplace: () => void
  labelReplace: string
  labelRemove: string
  disabled?: boolean
}) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
      {uploaded.previewUrl && !hasError ? (
        /* Image preview fills the container */
        <div className="relative flex min-h-[140px] max-h-[320px] w-full items-center justify-center overflow-hidden bg-muted/30">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploaded.previewUrl}
            alt={uploaded.file.name}
            className="relative z-10 max-h-[320px] w-auto max-w-[90%] object-contain py-8 transition-transform duration-500 group-hover:scale-[1.02]"
            onError={() => setHasError(true)}
          />
        </div>
      ) : (
        /* Non-image or error fallback */
        <div className="flex items-center gap-4 bg-muted/10 px-5 py-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-foreground/5">
            <FileIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{uploaded.file.name || 'File'}</p>
            <p className="text-xs text-muted-foreground">
              {uploaded.file.size ? formatBytes(uploaded.file.size) : 'Ready for upload'}
            </p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between border-t bg-muted/5 px-4 py-3 text-xs">
        <span className="max-w-[200px] truncate font-medium text-muted-foreground">
          {uploaded.file.name || 'Logo'}
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            type="button"
            className="h-8 px-3 text-xs font-semibold shadow-none"
            onClick={onReplace}
            disabled={disabled}
          >
            {labelReplace}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-8 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRemove}
            disabled={disabled}
          >
            {labelRemove}
          </Button>
        </div>
      </div>
    </div>
  )
}
