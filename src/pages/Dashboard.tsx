
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";
import { useToast } from "@/components/ui/use-toast";
import { StudyTimeButton } from "@/components/study/StudyTimeButton";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(360); // 6 hours in minutes
  const [tasksData, setTasksData] = useState([]);
  
  useEffect(() => {
    if (user) {
      fetchStudyData();
    }
  }, [user]);

  // Fetch total study time and other data
  const fetchStudyData = async () => {
    try {
      setLoading(true);
      
      // Fetch all study sessions to calculate total time
      const { data: studySessions, error: studyError } = await supabase
        .from('study_sessions')
        .select('study_time')
        .eq('user_id', user?.id);
      
      if (studyError) throw studyError;
      
      // Calculate total minutes studied
      const totalMinutes = studySessions?.reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      setTotalStudyMinutes(totalMinutes);
      
      // Fetch recent tasks
      const { data: recentSessions, error: tasksError } = await supabase
        .from('study_sessions')
        .select(`
          id,
          date,
          subject_id,
          subjects:subject_id (name),
          registration_time,
          study_time,
          lesson,
          subtopic
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(4);
      
      if (tasksError) throw tasksError;
      
      // Format tasks data
      const formattedTasks = recentSessions?.map(session => ({
        id: session.id,
        title: session.lesson || session.subtopic || "Sessão de estudo",
        subject: session.subjects?.name || "Matéria",
        time: session.registration_time,
        duration: `${session.study_time} min`,
        status: "completed" as const,
      })) || [];
      
      setTasksData(formattedTasks);
      
    } catch (error) {
      console.error("Error fetching study data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os dados de estudo"
      });
    } finally {
      setLoading(false);
    }
  };

  // Recent task completion handler
  const handleCompleteTask = (id: string) => {
    setTasksData(
      tasksData.map((task) =>
        task.id === id ? { ...task, status: "completed" as const } : task
      )
    );
  };

  // Weekly chart data
  const chartData = [
    { name: "Seg", hours: 3, goal: 4 },
    { name: "Ter", hours: 5, goal: 4 },
    { name: "Qua", hours: 2, goal: 4 },
    { name: "Qui", hours: 4, goal: 4 },
    { name: "Sex", hours: 6, goal: 4 },
    { name: "Sáb", hours: 3, goal: 2 },
    { name: "Dom", hours: 1, goal: 2 },
  ];

  const streakData = {
    currentStreak: 5,
    days: [
      { date: "Seg", hasStudied: true },
      { date: "Ter", hasStudied: true },
      { date: "Qua", hasStudied: true },
      { date: "Qui", hasStudied: true },
      { date: "Sex", hasStudied: true },
      { date: "Sáb", hasStudied: false },
      { date: "Dom", hasStudied: false },
    ],
  };

  const subjects = [
    { id: "1", name: "Matemática", progress: 65, color: "bg-primary", totalTopics: 12, totalQuestions: 85, correctQuestions: 65 },
    { id: "2", name: "Física", progress: 40, color: "bg-secondary", totalTopics: 8, totalQuestions: 62, correctQuestions: 25 },
    { id: "3", name: "Química", progress: 75, color: "bg-accent", totalTopics: 10, totalQuestions: 95, correctQuestions: 71 },
    { id: "4", name: "Biologia", progress: 50, color: "bg-[#f59e0b]", totalTopics: 15, totalQuestions: 120, correctQuestions: 60 },
    { id: "5", name: "História", progress: 90, color: "bg-[#10b981]", totalTopics: 7, totalQuestions: 75, correctQuestions: 68 },
  ];

  const nextSessions = [
    {
      id: "1",
      title: "Química Orgânica",
      subject: "Química",
      date: "Amanhã",
      time: "09:00 - 10:30",
      duration: "1h 30min",
    },
    {
      id: "2",
      title: "Geometria",
      subject: "Matemática",
      date: "Amanhã",
      time: "11:00 - 12:30",
      duration: "1h 30min",
    },
    {
      id: "3",
      title: "Literatura Brasileira",
      subject: "Português",
      date: "Depois de amanhã",
      time: "09:00 - 10:30",
      duration: "1h 30min",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Dashboard" subtitle="Bem-vindo(a) de volta!">
          <Button>Planejar Nova Sessão</Button>
        </PageTitle>
        <StudyTimeButton />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <StatCard
          title="Horas Estudadas Total"
          value={formatMinutesToHoursAndMinutes(totalStudyMinutes)}
          icon={<Clock className="h-5 w-5" />}
          description={`Meta diária: ${formatMinutesToHoursAndMinutes(dailyTarget)}`}
        />
        <StatCard
          title="Total de Matérias"
          value="8"
          icon={<BookOpen className="h-5 w-5" />}
          description="2 matérias em dia"
        />
        <StatCard
          title="Metas Concluídas"
          value="5/9"
          icon={<Target className="h-5 w-5" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Streak Atual"
          value="5 dias"
          icon={<Award className="h-5 w-5" />}
          description="Melhor: 14 dias"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horas de Estudo na Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyStreak {...streakData} />
            <div className="mt-6">
              <SubjectProgress subjects={subjects} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudyTasks tasks={loading ? [] : tasksData} onComplete={handleCompleteTask} />
        </div>
        <div>
          <NextStudySessions sessions={nextSessions} />
        </div>
      </div>
    </div>
  );
}
