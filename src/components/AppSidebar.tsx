import * as React from "react";

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
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import {
  DotsHorizontalIcon,
  GearIcon,
  HomeIcon,
  LayersIcon,
} from "@radix-ui/react-icons";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="grid aspect-square size-7 place-items-center rounded-lg bg-mrt text-sidebar-primary-foreground">
                  <LayersIcon />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="uppercase">McGill Rocket Team</span>
                  <span className="text-muted-foreground">Ground Station</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={false}>
                  <Link
                    className="flex flex-row justify-between items-center"
                    to="/"
                  >
                    <div className="flex flex-row items-center gap-2">
                      <HomeIcon />
                      Home
                    </div>
                    <DotsHorizontalIcon />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>{" "}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Link className="flex flex-row items-center gap-2" to="settings">
            <GearIcon />
            Settings
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
