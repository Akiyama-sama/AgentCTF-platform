import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { SidebarHeaderLogo } from '@/components/layout/sider-bar-log'
import { sidebarData } from './data/sidebar-data'
import { useRouteContext } from '@tanstack/react-router'
import React from 'react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useRouteContext({
    from: '/_authenticated',
  })

  const filteredNavGroups = React.useMemo(() => {
    if (user.roles?.[0]?.id === 1) {
      return sidebarData.navGroups.filter(
        group => group.title !== '用户管理',
      )
    }
    return sidebarData.navGroups
  }, [user])

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        {filteredNavGroups.map(props => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
