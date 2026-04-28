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
            'cursor-pointer border border-dashed transition-colors',
            isDragging && 'border-primary bg-primary/5',
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UploadCloudIcon />
            </EmptyMedia>
            <EmptyTitle>{isDragging ? t.title_dragging : t.title}</EmptyTitle>
            <EmptyDescription>
              {descriptionText}
              {accept && ` · ${accept}`}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={e => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              {t.browse}
            </Button>
          </EmptyContent>
        </Empty>
      ) : isMultiple ? (
        /* ── Multi-file grid ───────────────────────────────────────────── */
        <div
          className={cn(
            'rounded-xl border border-dashed p-3 transition-colors',
            isDragging && 'border-primary bg-primary/5',
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
                className="flex aspect-square items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <UploadCloudIcon className="size-6" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Single file preview (full width) ─────────────────────────── */
        <SingleFilePreview
          uploaded={files[0] || { file: new File([], ''), previewUrl: initialUrl }}
          onRemove={() => remove(0)}
          onReplace={() => {
            setReplaceIdx(0)
            inputRef.current?.click()
          }}
          labelReplace={t.replace}
          labelRemove={t.remove}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive" role="alert">
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
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {uploaded.previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={uploaded.previewUrl}
          alt={uploaded.file.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center text-muted-foreground">
          <FileIcon className="size-7" />
          <span className="line-clamp-2 text-xs">{uploaded.file.name}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 ring-1 ring-foreground/10 backdrop-blur-sm transition-opacity group-hover:opacity-100"
        aria-label={ariaRemove}
      >
        <XIcon className="size-3.5" />
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
}: {
  uploaded: UploadedFile
  onRemove: () => void
  onReplace: () => void
  labelReplace: string
  labelRemove: string
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-muted">
      {uploaded.previewUrl ? (
        /* Image preview fills the container */
        <div className="relative flex max-h-[240px] w-full items-center justify-center bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploaded.previewUrl}
            alt={uploaded.file.name}
            className="max-h-[240px] w-auto object-contain"
          />
        </div>
      ) : (
        /* Non-image fallback */
        <div className="flex items-center gap-3 px-4 py-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-foreground/10">
            <FileIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{uploaded.file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(uploaded.file.size)}</p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span className="truncate">{uploaded.file.name}</span>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-7 px-2 text-xs"
            onClick={onReplace}
          >
            {labelReplace}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            {labelRemove}
          </Button>
        </div>
      </div>
    </div>
  )
}
