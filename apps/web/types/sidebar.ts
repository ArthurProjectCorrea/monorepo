import type { LucideIcon } from 'lucide-react'

export interface NavSubItem {
  title: string
  url: string
  icon?: React.ReactNode
  screenKey?: string
}

export interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  screenKey?: string
  isActive?: boolean
  items?: NavSubItem[]
}

export interface TeamItem {
  name: string
  logo: React.ReactNode
  plan: string
}

export interface UserItem {
  name: string
  email: string
  avatar: string
}

export interface SidebarData {
  user: UserItem
  teams: TeamItem[]
  navMain: NavItem[]
}

export interface SidebarDict {
  groups: {
    platform: string
  }
  nav_main: {
    dashboard: string
    settings: string
    general: string
    teams: string
    parameters: string
    screen_parameters: string
    access_profiles: string
    users: string
  }
}
