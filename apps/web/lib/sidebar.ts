import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  MonitorCog,
  Cast,
  Layers,
  Users,
  ShieldCheck,
  User,
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
        icon: createElement(SettingsIcon),
        items: [
          {
            title: navMainDict.general || 'General',
            icon: createElement(Layers),
            url: `/${domain}/settings/general`,
          },
          {
            title: navMainDict.users || 'Users',
            icon: createElement(User),
            url: `/${domain}/settings/users`,
          },
          {
            title: navMainDict.access_profiles || 'Access Profiles',
            icon: createElement(ShieldCheck),
            url: `/${domain}/settings/access-profiles`,
          },
          {
            title: navMainDict.teams || 'Team',
            icon: createElement(Users),
            url: `/${domain}/settings/teams`,
          },
        ],
      },
      {
        title: navMainDict.parameters || 'Parameters',
        icon: createElement(MonitorCog),
        items: [
          {
            title: navMainDict.screens || 'Screens',
            icon: createElement(Cast),
            url: `/${domain}/parameters/screens`,
          },
          {
            title: navMainDict.fields || 'Fields',
            icon: createElement(MonitorCog),
            url: `/${domain}/parameters/fields`,
          },
        ],
      },
    ],
  }
}
