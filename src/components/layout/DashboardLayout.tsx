
import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RequireSubscription } from "@/components/subscription/RequireSubscription";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <RequireSubscription redirectTo="/settings">
      <div className="flex min-h-screen">
        <Sidebar className="hidden md:flex" />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </RequireSubscription>
  );
}
