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
import { Link, useLocation, useNavigate } from "react-router";
import {
  CopyIcon,
  DotsHorizontalIcon,
  LayersIcon,
  Pencil1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useUserSettingsStore } from "@/lib/dashboard-persistance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const {
    getDashboardList,
    saveDashboard,
    deleteDashboard,
    updateDashboardMetadata,
  } = useUserSettingsStore();
  const dashboards = getDashboardList();
  const navigate = useNavigate();
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
          <SidebarGroupAction asChild>
            <button
              onClick={() => {
                saveDashboard({
                  slug: crypto.randomUUID(),
                  name: "New Dashboard",
                });
              }}
            >
              <PlusIcon className="size-3" />
            </button>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboards?.map((dashboard) => (
                <SidebarMenuItem key={dashboard.slug}>
                  <DropdownMenu>
                    <SidebarMenuButton
                      isActive={location.pathname == `/${dashboard.slug}`}
                      onClick={() => {
                        navigate(`/${dashboard.slug}`);
                      }}
                      className="py-2"
                    >
                      <>
                        {dashboard.name}
                        <DropdownMenuTrigger asChild>
                          <DotsHorizontalIcon className="absolute right-0 top-1/2 -translate-y-1/2" />
                        </DropdownMenuTrigger>
                      </>
                    </SidebarMenuButton>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          const newName = prompt("Enter a new name:");
                          if (newName) {
                            updateDashboardMetadata({
                              oldSlug: dashboard.slug,
                              newName,
                            });
                          }
                        }}
                      >
                        Rename
                        <DropdownMenuShortcut>
                          <Pencil1Icon />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          saveDashboard({
                            slug: crypto.randomUUID(),
                            name: `${dashboard.name} Copy`,
                            dockview: dashboard.dockview,
                          });
                        }}
                      >
                        Duplicate{" "}
                        <DropdownMenuShortcut>
                          <CopyIcon />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteDashboard(dashboard.slug)}
                        variant="destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
