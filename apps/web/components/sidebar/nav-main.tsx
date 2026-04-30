'use client'

import * as React from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronRightIcon, MoreHorizontalIcon, EllipsisVertical } from 'lucide-react'
import type { SidebarDict } from '@/types/sidebar'
import Link from 'next/link'

export function NavMain({
  items,
  dict,
}: {
  items: {
    title: string
    url?: string
    icon?: React.ReactNode
    isActive?: boolean
    type?: 'colapsable' | 'dropdown' | 'drawer' | string
    items?: {
      title: string
      url: string
      icon?: React.ReactNode
    }[]
  }[]
  dict: { sidebar?: SidebarDict }
}) {
  const { isMobile, setOpenMobile, state, setOpen } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{dict?.sidebar?.groups?.platform || 'Platform'}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map(item => {
          const hasSubItems = item.items && item.items.length > 0

          {
            /* Simple items (no sub-items) - already responsive */
          }
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  {item.url ? (
                    <Link href={item.url} onClick={handleLinkClick}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div>
                      {item.icon}
                      <span>{item.title}</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          return (
            <React.Fragment key={item.title}>
              {/* MOBILE View: Collapsible (Hidden on Desktop) */}
              <Collapsible
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible md:hidden"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url} onClick={handleLinkClick}>
                              {/* Mobile: No sub-icons */}
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* DESKTOP View: Dropdown (Hidden on Mobile) */}
              <SidebarMenuItem className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon}
                      <span>{item.title}</span>
                      <EllipsisVertical className="ml-auto size-4 text-muted-foreground/50" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 rounded-lg" side="right" align="start">
                    {item.items?.map(subItem => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link href={subItem.url} onClick={handleLinkClick}>
                          {/* Desktop: Show sub-icons */}
                          {subItem.icon}
                          <span>{subItem.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </React.Fragment>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
