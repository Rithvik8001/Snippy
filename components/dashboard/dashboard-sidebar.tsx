"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import {
  Home,
  Code2,
  FileText,
  Terminal,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

const navigation = [
  {
    title: "Home",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "All Snippets",
    icon: Code2,
    href: "/dashboard/snippets",
  },
  {
    title: "Code",
    icon: Code2,
    href: "/dashboard/snippets?type=code",
  },
  {
    title: "Text",
    icon: FileText,
    href: "/dashboard/snippets?type=text",
  },
  {
    title: "Commands",
    icon: Terminal,
    href: "/dashboard/snippets?type=command",
  },
  {
    title: "Favorites",
    icon: Star,
    href: "/dashboard/snippets?favorite=true",
  },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex size-8 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent/50">
            <Logo size={18} />
          </div>
          <span className="font-lavishly-yours text-3xl font-normal leading-none text-center">
            Snippy
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href.split("?")[0]);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings" asChild>
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SignOutButton>
              <SidebarMenuButton tooltip="Sign Out" className="w-full">
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
