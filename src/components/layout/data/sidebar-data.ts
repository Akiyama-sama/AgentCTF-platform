import {
  IconLayoutDashboard,
  IconPalette,
  IconPencil,
  IconSettings,
  IconShieldCode,
  IconTool,
  IconUserCog,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'mio',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: '通用',
      items: [
        {
          title: '主页',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title:'组件练习',
          url:'/lab'
        },
        {
          title: 'Agent攻防',
          url: '/scenarios',
          icon: IconShieldCode,
        },
        {
          title: '演练',
          url: '/exercises',
          icon: IconPencil ,
        }
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          icon: IconSettings,
          items: [
            {
              title: '个人信息',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Agent设置',
              url: '/settings/agent',
              icon: IconTool,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: IconPalette,
            },
          ],
        },
      ],
    },
  ],
}
