
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  BarChart,
  Target,
  Bookmark,
  User,
  Settings,
  BookOpen,
  Clock,
  LayoutDashboard,
  History
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendário", icon: Calendar },
  { href: "/progress", label: "Progresso", icon: BarChart },
  { href: "/goals", label: "Metas", icon: Target },
  { href: "/resources", label: "Recursos", icon: Bookmark },
  { href: "/subjects", label: "Matérias", icon: BookOpen },
  { href: "/activity", label: "Atividades", icon: Clock },
  { href: "/history", label: "Histórico", icon: History },
  { href: "/profile", label: "Perfil", icon: User },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const path = location.pathname;

  return (
    <Sidebar collapsible="icon" className="border-r bg-background">
      <SidebarHeader className="border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-2">
          <Link to="/" className="flex items-center gap-2">
            <h2 className={`font-bold tracking-tight transition-all ${
              state === "collapsed" ? "text-lg" : "text-xl"
            }`}>
              {state === "collapsed" ? "ST" : "StudyTrack"}
            </h2>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = path === item.href;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
