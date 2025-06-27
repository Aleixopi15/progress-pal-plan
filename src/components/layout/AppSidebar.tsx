
import {
  Calendar,
  Home,
  BookOpen,
  BarChart3,
  Target,
  Settings,
  User,
  Clock,
  PieChart,
  Activity,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/app",
    icon: Home,
  },
  {
    title: "Matérias",
    url: "/app/subjects",
    icon: BookOpen,
  },
  {
    title: "Histórico",
    url: "/app/history",
    icon: Clock,
  },
  {
    title: "Cronograma",
    url: "/app/calendar",
    icon: Calendar,
  },
  {
    title: "Metas",
    url: "/app/goals",
    icon: Target,
  },
  {
    title: "Progresso",
    url: "/app/progress",
    icon: BarChart3,
  },
  {
    title: "Atividade",
    url: "/app/activity",
    icon: Activity,
  },
  {
    title: "Simulados",
    url: "/app/simulados",
    icon: PieChart,
  },
];

const settingsItems = [
  {
    title: "Perfil",
    url: "/app/profile",
    icon: User,
  },
  {
    title: "Configurações",
    url: "/app/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplicativo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
