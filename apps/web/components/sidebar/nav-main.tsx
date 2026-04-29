'use client'

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
import { ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
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
    type?: 'colapsable' | 'dropdown' | string
    items?: {
      title: string
      url: string
      icon?: React.ReactNode
    }[]
  }[]
  dict: { sidebar?: SidebarDict }
}) {
  const { isMobile, setOpenMobile } = useSidebar()

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

          // Type: SIMPLE (no sub-items)
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

          // Type: DROPDOWN
          if (item.type === 'dropdown') {
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction showOnHover>
                      <MoreHorizontalIcon />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align={isMobile ? 'end' : 'start'}
                  >
                    {item.items?.map(subItem => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link href={subItem.url} onClick={handleLinkClick}>
                          {subItem.icon}
                          <span>{subItem.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          // Type: COLAPSABLE (Default for items with children)
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
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
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
