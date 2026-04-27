'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface AuthDrawerProps {
  triggerText: string
  title: string
  description?: string
  content: string
  closeText: string
}

export function AuthDrawer({
  triggerText,
  title,
  description,
  content,
  closeText,
}: AuthDrawerProps) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <button className="hover:text-primary transition-colors cursor-pointer">
          {triggerText}
        </button>
      </DrawerTrigger>
      <DrawerContent
        aria-describedby={undefined}
        className="h-full w-100 ml-auto rounded-none border-l"
      >
        <DrawerHeader className="border-b pb-6">
          <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 text-sm text-muted-foreground leading-relaxed">
          {content.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <DrawerFooter className="border-t pt-6">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full rounded-xl">
              {closeText}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
