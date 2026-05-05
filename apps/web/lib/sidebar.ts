import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Settings,
  MonitorCog,
  Cast,
  Layers,
  Users,
  ShieldCheck,
  User,
} from 'lucide-react'
import { createElement } from 'react'
import type { Dictionary } from '@/types/i18n'
import { getSessionData, hasPermission } from '@/lib/session'
import type { SidebarData, NavItem, NavSubItem } from '@/types/sidebar'

/**
 * Generates the sidebar data structure with dynamic domain and permission filtering.
 */
export const getSidebarData = async (
  domain: string,
  dict: Dictionary,
  sessionId: string,
): Promise<SidebarData & { labels: { platform: string } }> => {
  const sidebarDict = dict.sidebar
  const navMainDict = sidebarDict.nav_main
  const session = await getSessionData(sessionId)

  const navMainRaw = [
    {
      title: navMainDict.dashboard,
      url: `/${domain}/dashboard`,
      icon: LayoutDashboard,
      screenKey: 'dashboard',
    },
    {
      title: navMainDict.settings,
      icon: Settings,
      items: [
        {
          title: navMainDict.general,
          url: `/${domain}/settings/general`,
          screenKey: 'general',
          icon: Layers,
        },
        {
          title: navMainDict.users,
          url: `/${domain}/settings/users`,
          screenKey: 'users',
          icon: User,
        },
        {
          title: navMainDict.access_profiles,
          url: `/${domain}/settings/access-profiles`,
          screenKey: 'access_profiles',
          icon: ShieldCheck,
        },
        {
          title: navMainDict.teams,
          url: `/${domain}/settings/teams`,
          screenKey: 'teams',
          icon: Users,
        },
      ],
    },
    {
      title: navMainDict.parameters,
      icon: MonitorCog,
      items: [
        {
          title: navMainDict.screen_parameters,
          url: `/${domain}/parameters/screens`,
          screenKey: 'screen_parameters',
          icon: Cast,
        },
      ],
    },
  ]

  // Filter items by permission and map icons
  const filteredNavMain = await Promise.all(
    navMainRaw.map(async (group): Promise<NavItem | null> => {
      // If it's a leaf item with a screenKey
      if (group.url) {
        const canView = group.screenKey
          ? await hasPermission(sessionId, group.screenKey, 'view')
          : true
        if (!canView) return null

        return {
          title: group.title,
          url: group.url,
          icon: createElement(group.icon),
          screenKey: group.screenKey,
        }
      }

      // If it has sub-items, filter them
      if (group.items) {
        const filteredItems = (
          await Promise.all(
            group.items.map(async (item): Promise<NavSubItem | null> => {
              const canView = item.screenKey
                ? await hasPermission(sessionId, item.screenKey, 'view')
                : true
              if (!canView) return null

              return {
                title: item.title,
                url: item.url,
                screenKey: item.screenKey,
                icon: createElement(item.icon),
              }
            }),
          )
        ).filter((item): item is NavSubItem => item !== null)

        // If no sub-items left, hide the group
        if (filteredItems.length === 0) return null

        return {
          title: group.title,
          url: '',
          icon: createElement(group.icon),
          screenKey: group.screenKey,
          items: filteredItems,
        }
      }

      return null
    }),
  )

  return {
    user: {
      name: session?.me?.name || 'User',
      email: session?.me?.email || '',
      avatar: '',
    },
    teams: [
      {
        name: session?.display_name || 'Organization',
        logo: createElement(GalleryVerticalEnd),
        plan: 'Enterprise',
      },
    ],
    navMain: filteredNavMain.filter((item): item is NavItem => item !== null),
    labels: {
      platform: sidebarDict.groups.platform,
    },
  }
}
