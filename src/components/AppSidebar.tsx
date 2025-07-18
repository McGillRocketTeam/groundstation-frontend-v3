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
            <button
              onClick={() => {
                saveDashboard({
                  name: `New Dashboard ${(dashboards?.length ?? 0) + 1}`,
                  slug: `new-dashboard-${(dashboards?.length ?? 0) + 1}`,
                  dockview: {
                    grid: {
                      root: {
                        type: "branch",
                        data: [
                          {
                            type: "branch",
                            data: [
                              {
                                type: "leaf",
                                data: {
                                  views: [
                                    "panel_6",
                                    "0b58ce19-939e-44b9-a2ec-223be51aa96c",
                                    "219e4ca8-0b7b-477a-8149-e3a75dcceb4a",
                                    "81eb056f-6750-416a-883a-a7974429140d",
                                  ],
                                  activeView:
                                    "81eb056f-6750-416a-883a-a7974429140d",
                                  id: "1",
                                },
                                size: 727,
                              },
                              {
                                type: "leaf",
                                data: {
                                  views: [
                                    "a891572c-8ad8-494b-9bd1-091722806f96",
                                  ],
                                  activeView:
                                    "a891572c-8ad8-494b-9bd1-091722806f96",
                                  id: "4",
                                },
                                size: 346,
                              },
                            ],
                            size: 1056,
                          },
                          {
                            type: "branch",
                            data: [
                              {
                                type: "leaf",
                                data: {
                                  views: [
                                    "344b7d3d-ac95-4738-911d-736396d734d9",
                                    "013ad7bf-007b-4906-a35e-52ac894c3b04",
                                  ],
                                  activeView:
                                    "013ad7bf-007b-4906-a35e-52ac894c3b04",
                                  id: "3",
                                },
                                size: 367,
                              },
                              {
                                type: "leaf",
                                data: {
                                  views: [
                                    "586a0eee-dd5b-4a6f-ba2b-714fab0778a0",
                                  ],
                                  activeView:
                                    "586a0eee-dd5b-4a6f-ba2b-714fab0778a0",
                                  id: "2",
                                },
                                size: 706,
                              },
                            ],
                            size: 713,
                          },
                        ],
                        size: 1073,
                      },
                      width: 1769,
                      height: 1073,
                      orientation: Orientation.HORIZONTAL,
                    },
                    panels: {
                      panel_6: {
                        id: "panel_6",
                        contentComponent: "connectedDevices",
                        tabComponent: "default",
                        title: "Connected Devices",
                      },
                    },
                    activeGroup: "1",
                  },
                });
              }}
            >
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
