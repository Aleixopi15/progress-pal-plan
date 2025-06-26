
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, Clock, HelpCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { CreateGoalDialog } from "@/components/goals/CreateGoalDialog";

interface DailyGoal {
  id: string;
  date: string;
  target_hours: number;
  target_questions: number;
  achieved_hours: number;
  achieved_questions: number;
}

interface UserSettings {
  meta_horas_diarias: number;
  meta_questoes_diarias: number;
}

export function DailyGoalsCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    meta_horas_diarias: 6,
    meta_questoes_diarias: 50
  });
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDailyGoal();
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('meta_horas_diarias, meta_questoes_diarias')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (data) {
        setUserSettings({
          meta_horas_diarias: data.meta_horas_diarias || 6,
          meta_questoes_diarias: data.meta_questoes_diarias || 50
        });
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    }
  };

  const fetchDailyGoal = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar meta do dia atual
      const { data: goalData } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .maybeSingle();

      if (goalData) {
        setDailyGoal(goalData);
      } else {
        // Criar meta do dia automaticamente com base nas configurações do usuário
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('meta_horas_diarias, meta_questoes_diarias')
          .eq('user_id', user?.id)
          .maybeSingle();

        const targetHours = settingsData?.meta_horas_diarias || 6;
        const targetQuestions = settingsData?.meta_questoes_diarias || 50;

        const { data: newGoal, error } = await supabase
          .from('daily_goals')
          .insert({
            user_id: user?.id,
            date: today,
            target_hours: targetHours,
            target_questions: targetQuestions
          })
          .select()
          .single();

        if (error) throw error;
        setDailyGoal(newGoal);
      }

      // Calcular progresso atual baseado nas sessões de estudo do dia
      await updateDailyProgress();
    } catch (error) {
      console.error("Erro ao buscar meta diária:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Buscar sessões de estudo do dia
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('study_time')
        .eq('user_id', user?.id)
        .eq('date', today);

      // Buscar questões do dia
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('user_id', user?.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      const totalMinutes = sessions?.reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      const achievedHours = Math.round((totalMinutes / 60) * 10) / 10; // Uma casa decimal
      const achievedQuestions = questions?.length || 0;

      // Atualizar meta diária
      const { error } = await supabase
        .from('daily_goals')
        .update({
          achieved_hours: achievedHours,
          achieved_questions: achievedQuestions,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)
        .eq('date', today);

      if (error) throw error;

      // Atualizar estado local
      setDailyGoal(prev => prev ? {
        ...prev,
        achieved_hours: achievedHours,
        achieved_questions: achievedQuestions
      } : null);
    } catch (error) {
      console.error("Erro ao atualizar progresso diário:", error);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hoursProgress = dailyGoal ? Math.min((dailyGoal.achieved_hours / dailyGoal.target_hours) * 100, 100) : 0;
  const questionsProgress = dailyGoal ? Math.min((dailyGoal.achieved_questions / dailyGoal.target_questions) * 100, 100) : 0;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas do Dia
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Horas de Estudo</span>
                </div>
                <span className="font-medium">
                  {dailyGoal?.achieved_hours || 0}h / {dailyGoal?.target_hours || userSettings.meta_horas_diarias}h
                </span>
              </div>
              <Progress value={hoursProgress} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-green-500" />
                  <span>Questões</span>
                </div>
                <span className="font-medium">
                  {dailyGoal?.achieved_questions || 0} / {dailyGoal?.target_questions || userSettings.meta_questoes_diarias}
                </span>
              </div>
              <Progress value={questionsProgress} className="h-2" />
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso Geral</span>
              <span>{Math.round((hoursProgress + questionsProgress) / 2)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGoalCreated={() => {
          setCreateDialogOpen(false);
          fetchDailyGoal();
        }}
      />
    </>
  );
}
