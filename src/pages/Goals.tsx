import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Clock, CheckCircle, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { GoalCard } from "@/components/goals/GoalCard";
import { CreateGoalDialog } from "@/components/goals/CreateGoalDialog";
import { GoalNotifications } from "@/components/goals/GoalNotifications";

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: "subject" | "time" | "task";
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  subject_id?: string;
  priority: "high" | "medium" | "low";
  is_completed: boolean;
  subject_name?: string;
}

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          subjects:subject_id (name)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals = data?.map(goal => ({
        ...goal,
        type: goal.type as "subject" | "time" | "task",
        priority: goal.priority as "high" | "medium" | "low",
        subject_name: goal.subjects?.name
      })) || [];

      setGoals(formattedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as metas"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const isCompleted = newValue >= goal.target_value;
      
      const { error } = await supabase
        .from('user_goals')
        .update({
          current_value: Math.min(newValue, goal.target_value),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.map(g => 
        g.id === goalId 
          ? { 
              ...g, 
              current_value: Math.min(newValue, g.target_value),
              is_completed: isCompleted
            }
          : g
      ));

      if (isCompleted) {
        toast({
          title: "🎉 Meta concluída!",
          description: "Parabéns! Você alcançou sua meta."
        });
      }
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a meta"
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== goalId));
      
      toast({
        title: "Meta removida",
        description: "A meta foi removida com sucesso."
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a meta"
      });
    }
  };

  const getFilteredGoals = (filter: string) => {
    switch (filter) {
      case "subject":
      case "time": 
      case "task":
        return goals.filter(goal => goal.type === filter);
      case "completed":
        return goals.filter(goal => goal.is_completed);
      default:
        return goals;
    }
  };

  const completedGoals = goals.filter(g => g.is_completed).length;
  const totalGoals = goals.length;
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const subjectGoals = goals.filter(g => g.type === "subject");
  const timeGoals = goals.filter(g => g.type === "time");
  const taskGoals = goals.filter(g => g.type === "task");

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-8 bg-muted rounded w-32 mb-2"></div>
            <div className="h-4 bg-muted rounded w-48"></div>
          </div>
          <div className="h-10 bg-muted rounded w-24"></div>
        </div>
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageTitle 
        title="Metas" 
        subtitle="Configure e acompanhe suas metas de estudo"
      >
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 
          Nova Meta
        </Button>
      </PageTitle>

      {/* Notificações de metas */}
      <GoalNotifications />

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Metas concluídas</span>
                <span className="font-medium">{completedGoals}/{totalGoals}</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(completionRate)}% das suas metas foram concluídas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Matérias</span>
                </div>
                <span className="font-medium">{subjectGoals.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <span>Tempo</span>
                </div>
                <span className="font-medium">{timeGoals.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <span>Tarefas</span>
                </div>
                <span className="font-medium">{taskGoals.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximos Prazos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {goals
                .filter(g => g.deadline && !g.is_completed)
                .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                .slice(0, 3)
                .map((goal) => (
                  <div key={goal.id} className="text-xs">
                    <p className="font-medium truncate">{goal.title}</p>
                    <p className="text-muted-foreground">
                      {new Date(goal.deadline!).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                ))}
              {goals.filter(g => g.deadline && !g.is_completed).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum prazo próximo</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs com as metas */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="subject">Matérias</TabsTrigger>
          <TabsTrigger value="time">Tempo</TabsTrigger>
          <TabsTrigger value="task">Tarefas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        {["all", "subject", "time", "task", "completed"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {getFilteredGoals(tab).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredGoals(tab).map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {tab === "completed" ? "Nenhuma meta concluída" : "Nenhuma meta encontrada"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tab === "completed" 
                      ? "Complete algumas metas para vê-las aqui."
                      : "Crie sua primeira meta para começar a acompanhar seu progresso."
                    }
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Meta
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGoalCreated={fetchGoals}
      />
    </div>
  );
}
