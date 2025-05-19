
"use client"; // SidebarProvider and hooks require client context

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SiteLogo } from "@/components/shared/site-logo";
import { LayoutDashboard } from "lucide-react"; // Removed Brain icon
import type { PropsWithChildren } from "react";

// A client component to use useSidebar hook for the trigger
function AppHeader() {
  const { isMobile } = useSidebar();
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
        {isMobile && <SidebarTrigger className="md:hidden" />}
        <div className="flex-1">
          {/* Placeholder for breadcrumbs or page title */}
        </div>
        {/* Logout button removed as per user request */}
      </header>
  );
}


export default function AppLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Daily Log", icon: LayoutDashboard },
    // { href: "/ai-query", label: "AI Query", icon: Brain }, // Removed AI Query link
  ];

  // Initialize with a consistent value for SSR and initial client render.
  // The SidebarProvider will handle cookie synchronization internally.
  const staticDefaultSidebarOpen = true;


  return (
    <SidebarProvider defaultOpen={staticDefaultSidebarOpen}>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4">
          <SiteLogo showText={false} iconClassName="h-7 w-7 text-sidebar-primary" />
           <div className="group-data-[collapsible=icon]:hidden ml-2">
             <h1 className="text-lg font-semibold text-sidebar-foreground">Sentinel Watch</h1>
           </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{children: item.label, className: "bg-primary text-primary-foreground"}}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
