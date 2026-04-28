import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  MonitorCog,
  Cast,
} from 'lucide-react'
import { createElement } from 'react'
import type { SidebarDict } from '@/types/sidebar'

export const getSidebarData = (domain: string, dict: { sidebar?: SidebarDict }) => {
  const sidebarDict = dict?.sidebar || {}
  const navMainDict = sidebarDict.nav_main || {}

  return {
    user: {
      name: 'shadcn',
      email: 'm@example.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'Acme Inc',
        logo: createElement(GalleryVerticalEndIcon),
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: createElement(AudioLinesIcon),
        plan: 'Startup',
      },
      {
        name: 'Evil Corp.',
        logo: createElement(TerminalIcon),
        plan: 'Free',
      },
    ],
    navMain: [
      {
        title: navMainDict.dashboard || 'Dashboard',
        url: `/${domain}/dashboard`,
        icon: createElement(LayoutDashboardIcon),
      },
      {
        title: navMainDict.settings || 'Settings',
        url: '#',
        icon: createElement(SettingsIcon),
        type: 'colapsable',
        items: [
          { title: navMainDict.general || 'General', url: `/${domain}/settings/general` },
          { title: navMainDict.team || 'Team', url: `/${domain}/settings/team` },
        ],
      },
      {
        title: 'Parameters',
        icon: createElement(MonitorCog),
        type: 'dropdown',
        items: [
          { title: 'Screens', icon: createElement(Cast), url: `/${domain}/parameters/screens` },
          { title: 'Fields', icon: createElement(MonitorCog), url: `/${domain}/parameters/fields` },
        ],
      },
    ],
    projects: [
      {
        name: 'Design Engineering',
        url: `/${domain}/projects/design`,
        icon: createElement(FrameIcon),
      },
      {
        name: 'Sales & Marketing',
        url: `/${domain}/projects/sales`,
        icon: createElement(PieChartIcon),
      },
      { name: 'Travel', url: `/${domain}/projects/travel`, icon: createElement(MapIcon) },
    ],
  }
}
