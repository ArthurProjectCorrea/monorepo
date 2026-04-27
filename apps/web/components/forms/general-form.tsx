'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { InputUpload, type InputUploadDict } from '@/components/input-upload'

// ─── Dict shape ───────────────────────────────────────────────────────────────

export interface GeneralFormDict {
  breadcrumb_settings: string
  media_title: string
  media_description: string
  info_title: string
  info_description: string
  name_label: string
  name_placeholder: string
  name_description: string
  description_label: string
  description_placeholder: string
  description_description: string
  discard: string
  save: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface GeneralFormProps {
  dict: GeneralFormDict
  dictUpload: InputUploadDict
}

export function GeneralForm({ dict, dictUpload }: GeneralFormProps) {
  return (
    <form className="grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
      {/* ── Left column: media card ─────────────────────────────────── */}
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{dict.media_title}</CardTitle>
          <CardDescription>{dict.media_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <InputUpload
            dict={dictUpload}
            accept="image/png, image/jpeg, image/webp"
            maxSize={4 * 1024 * 1024}
            maxFiles={1}
          />
        </CardContent>
      </Card>

      {/* ── Right column: fields card ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.info_title}</CardTitle>
          <CardDescription>{dict.info_description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              {/* Name */}
              <Field>
                <FieldLabel htmlFor="general-name">{dict.name_label}</FieldLabel>
                <Input id="general-name" placeholder={dict.name_placeholder} />
                <FieldDescription>{dict.name_description}</FieldDescription>
                <FieldError />
              </Field>

              {/* Description */}
              <Field>
                <FieldLabel htmlFor="general-description">{dict.description_label}</FieldLabel>
                <Textarea
                  id="general-description"
                  placeholder={dict.description_placeholder}
                  rows={4}
                />
                <FieldDescription>{dict.description_description}</FieldDescription>
                <FieldError />
              </Field>
            </FieldGroup>
          </FieldSet>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" type="reset">
              {dict.discard}
            </Button>
            <Button type="submit">{dict.save}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
