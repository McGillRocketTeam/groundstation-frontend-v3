import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import {
  DotsHorizontalIcon,
  LayersIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { getDashboardList, saveDashboard } from "@/lib/dashboard-persistance";
import { Dialog } from "./ui/dialog";
import { Orientation } from "dockview-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const dashboards = getDashboardList();
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
          <SidebarGroupAction>
            <button onClick={() => {}}>
              <PlusIcon className="size-3" />
            </button>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboards?.map((dashboard) => (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname == "/"}
                  >
                    <Link
                      className="flex flex-row justify-between items-center"
                      to={`/${dashboard.slug}`}
                    >
                      <div className="flex flex-row items-center gap-2">
                        {dashboard.name}
                      </div>
                      <DotsHorizontalIcon />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton isActive={location.pathname == "/settings"} asChild>
          <Link className="flex flex-row items-center gap-2" to="settings">
            Settings
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
