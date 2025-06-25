
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Calendar } from "lucide-react";

interface GoalNotification {
  id: string;
  goal_id: string;
  notification_date: string;
  is_sent: boolean;
  user_goals: {
    title: string;
    deadline: string;
    type: string;
    target_value: number;
    unit: string;
  };
}

export function Header() {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState<GoalNotification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('goal_notifications')
        .select(`
          *,
          user_goals!inner (
            title,
            deadline,
            type,
            target_value,
            unit,
            is_completed
          )
        `)
        .eq('user_id', user?.id)
        .eq('notification_date', today)
        .eq('is_sent', false)
        .eq('user_goals.is_completed', false);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if (notifications.length > 0) {
      const notificationIds = notifications.map(n => n.id);
      await supabase
        .from('goal_notifications')
        .update({ is_sent: true })
        .in('id', notificationIds);
      
      setNotifications([]);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "subject":
        return "Matéria";
      case "time":
        return "Tempo";
      case "task":
        return "Tarefa";
      default:
        return type;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" onClick={fetchNotifications}>
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-600 text-[10px] font-medium text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Notificações</h4>
                {notifications.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={markNotificationsAsRead}>
                    Marcar como lidas
                  </Button>
                )}
              </div>
              
              {loading ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Carregando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma notificação no momento
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <Card key={notification.id} className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                            <Target className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-amber-900 dark:text-amber-100">
                              {notification.user_goals.title}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>Prazo hoje!</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs h-5">
                                {getTypeLabel(notification.user_goals.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {notification.user_goals.target_value} {notification.user_goals.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block">{user?.email}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
