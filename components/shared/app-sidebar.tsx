import * as React from 'react';
import { BarChartIcon, FolderIcon, LayoutDashboardIcon } from 'lucide-react';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },

    {
      title: 'Projects',
      url: '/projects',
      icon: FolderIcon,
    },
    {
      title: 'Analytics',
      url: '#',
      icon: BarChartIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  if (!session || !session.user || !session.user.email) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <span className="text-base font-semibold">Multi-User Project</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>{session.user.email && <NavUser user={session.user} />}</SidebarFooter>
    </Sidebar>
  );
}
