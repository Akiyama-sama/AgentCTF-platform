import {
  IconLayoutDashboard,
  IconPalette,
  IconPencil,
  IconSettings,
  IconShieldCode,
  IconTool,
  IconUser,
  IconUserCog,
} from '@tabler/icons-react'

import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {


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
      title: '用户管理',
      items: [
        {
          title: '用户管理',
          url: '/users',
          icon: IconUser,
        },
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
