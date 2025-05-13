
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
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

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const path = location.pathname;

  const links = [
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

  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r bg-background p-4 w-[240px]",
        className
      )}
    >
      <Link to="/" className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">StudyTrack</h2>
      </Link>
      <nav className="flex-1 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = path === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
