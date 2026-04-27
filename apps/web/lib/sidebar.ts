import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
} from 'lucide-react'
import { createElement } from 'react'

export const sidebarData = {
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
      title: 'Playground',
      url: '#',
      icon: createElement(TerminalSquareIcon),
      isActive: true,
      items: [
        { title: 'History', url: '#' },
        { title: 'Starred', url: '#' },
        { title: 'Settings', url: '#' },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: createElement(BotIcon),
      items: [
        { title: 'Genesis', url: '#' },
        { title: 'Explorer', url: '#' },
        { title: 'Quantum', url: '#' },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: createElement(BookOpenIcon),
      items: [
        { title: 'Introduction', url: '#' },
        { title: 'Get Started', url: '#' },
        { title: 'Tutorials', url: '#' },
        { title: 'Changelog', url: '#' },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: createElement(Settings2Icon),
      items: [
        { title: 'General', url: '#' },
        { title: 'Team', url: '#' },
        { title: 'Billing', url: '#' },
        { title: 'Limits', url: '#' },
      ],
    },
  ],
  projects: [
    { name: 'Design Engineering', url: '#', icon: createElement(FrameIcon) },
    { name: 'Sales & Marketing', url: '#', icon: createElement(PieChartIcon) },
    { name: 'Travel', url: '#', icon: createElement(MapIcon) },
  ],
}
