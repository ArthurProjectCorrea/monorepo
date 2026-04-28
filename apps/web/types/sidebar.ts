// Shared dict type used across sidebar components and lib/sidebar.ts
export interface SidebarDict {
  groups?: {
    platform?: string
    projects?: string
  }
  nav_main?: {
    dashboard?: string
    settings?: string
    general?: string
    team?: string
    more?: string
  }
}
