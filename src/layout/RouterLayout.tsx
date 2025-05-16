import { AppSidebar } from "@/components/AppSidebar";
import ErrorMessage from "@/components/ErrorMessage";
import Header from "@/components/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";

export default function RouterLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ErrorBoundary fallbackRender={ErrorMessage}>
          <div className="grid grid-rows-[auto_1fr] w-full h-full">
            <Header />
            <Outlet />
          </div>
        </ErrorBoundary>
      </SidebarInset>
    </SidebarProvider>
  );
}
