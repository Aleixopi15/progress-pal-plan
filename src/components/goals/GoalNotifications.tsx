
import { useState, useEffect } from "react";
import { Bell, Calendar, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface GoalNotification {
  id: string;
  goal_id: string;
  notification_date: string;
  is_sent: boolean;
  goal: {
    title: string;
    deadline: string;
    type: string;
    target_value: number;
    unit: string;
  };
}

export function GoalNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<GoalNotification[]>([]);
  const [loading, setLoading] = useState(true);

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

      const formattedNotifications = data?.map(notification => ({
        ...notification,
        goal: notification.user_goals
      })) || [];

      setNotifications(formattedNotifications);

      // Marcar notificações como enviadas
      if (formattedNotifications.length > 0) {
        const notificationIds = formattedNotifications.map(n => n.id);
        await supabase
          .from('goal_notifications')
          .update({ is_sent: true })
          .in('id', notificationIds);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
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

  if (loading || notifications.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Bell className="h-4 w-4" />
          Metas com prazo próximo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-sm">{notification.goal.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Prazo: {new Date(notification.goal.deadline).toLocaleDateString("pt-BR")}</span>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(notification.goal.type)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Meta</p>
              <p className="text-sm font-medium">
                {notification.goal.target_value} {notification.goal.unit}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
