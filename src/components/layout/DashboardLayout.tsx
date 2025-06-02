
import React from "react";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { RequireSubscription } from "@/components/subscription/RequireSubscription";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <RequireSubscription redirectTo="/settings">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RequireSubscription>
  );
}
