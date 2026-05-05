'use client'

import * as React from 'react'

import { NavMain } from '@/components/custom/sidebar/nav-main'
import { NavUser } from '@/components/custom/sidebar/nav-user'
import { TeamSwitcher } from '@/components/custom/sidebar/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import type { SidebarData } from '@/types/sidebar'
import { useParams } from 'next/navigation'
export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  sidebarData: SidebarData & { labels: { platform: string } }
}

export function AppSidebar({ sidebarData, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} labels={sidebarData.labels} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
