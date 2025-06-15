'use client';

import { PlusCircleIcon, type LucideIcon, LayoutDashboardIcon, FolderIcon, BarChartIcon } from 'lucide-react';

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Dialog, DialogTrigger } from '../ui/dialog';
import AddProjectDialog from './add-project-dialog';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getProjects } from '@/lib/api';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboardIcon,
  },

  {
    title: 'Projects',
    url: '/projects',
    icon: FolderIcon,
    subItems: [
      {
        title: 'Project 1',
        url: '/projects/osduquwdh97127hgd7u9as',
      },
      {
        title: 'Project 2',
        url: '/projects/saidjdas98duy3h7p098sa',
      },
    ],
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChartIcon,
  },
];

export function NavMain() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
    placeholderData: keepPreviousData,
  });

  const pathname = usePathname();
  const isActive = (url: string) => pathname.startsWith(url);
  const onDialogOpen = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
              <DialogTrigger asChild className="w-full">
                <SidebarMenuButton
                  tooltip="Quick Create"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
                >
                  <PlusCircleIcon />
                  <span>Quick Create</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <AddProjectDialog onDialogOpen={onDialogOpen} />
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <>
          <SidebarMenu>
            {items.map((item) =>
              item.subItems ? (
                <Collapsible key={item.title} defaultOpen className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={false} tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {data?.data.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.name} className="ml-2">
                            <Link href={`/projects/${subItem.id}`}>
                              <SidebarMenuSubButton asChild isActive={isActive(`/projects/${subItem.id}`)}>
                                <span>{subItem.name}</span>
                              </SidebarMenuSubButton>
                            </Link>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton isActive={isActive(item.url)} tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
