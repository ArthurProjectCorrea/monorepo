'use client'

import * as React from 'react'

import { NavMain } from '@/components/sidebar/nav-main'
import { NavUser } from '@/components/sidebar/nav-user'
import { TeamSwitcher } from '@/components/sidebar/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useParams } from 'next/navigation'
import { getSidebarData } from '@/lib/sidebar'
import type { SidebarDict } from '@/types/sidebar'

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  lang: string
  dict: { sidebar?: SidebarDict }
}

export function AppSidebar({ dict, ...props }: AppSidebarProps) {
  const params = useParams()
  const domain = (params.domain as string) || '1'
  const sidebarData = getSidebarData(domain, dict)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} dict={dict} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
