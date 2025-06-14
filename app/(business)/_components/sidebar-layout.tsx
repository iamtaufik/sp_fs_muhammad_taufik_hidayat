'use client';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { SiteHeader } from '@/components/shared/site-header';

const SidebarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-6 py-4 md:gap-6 md:py-6">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SidebarLayout;
