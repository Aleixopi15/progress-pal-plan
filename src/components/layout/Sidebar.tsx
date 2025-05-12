
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Calendar, 
  BarChart2, 
  Target, 
  BookOpen, 
  User, 
  Settings, 
  Menu, 
  X,
  Book,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
}

const NavItem = ({ href, icon: Icon, label, isCollapsed, isActive }: NavItemProps) => {
  return (
    <Link to={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 rounded-lg px-3 py-2 text-base hover:bg-muted",
          isActive ? "bg-muted font-medium" : "font-normal",
          isCollapsed ? "px-2" : "px-3"
        )}
      >
        <Icon size={20} />
        {!isCollapsed && <span>{label}</span>}
        {isActive && isCollapsed && (
          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full" />
        )}
      </Button>
    </Link>
  );
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Para mobile começamos com collapsed
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/subjects", icon: Book, label: "Matérias" },
    { href: "/calendar", icon: Calendar, label: "Cronograma" },
    { href: "/progress", icon: BarChart2, label: "Progresso" },
    { href: "/goals", icon: Target, label: "Metas" },
    { href: "/resources", icon: BookOpen, label: "Recursos" },
    { href: "/profile", icon: User, label: "Perfil" },
    { href: "/settings", icon: Settings, label: "Configurações" },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[230px]",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <Link to="/dashboard" className="font-semibold text-lg">
            StudyPlan
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("", isCollapsed ? "ml-auto" : "")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <X size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-3">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              isActive={location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
