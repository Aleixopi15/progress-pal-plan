
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Target, Award, Calendar, TrendingUp } from "lucide-react";
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
  const [weeklyStudyMinutes, setWeeklyStudyMinutes] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(360); // 6 hours in minutes
  const [weeklyTarget, setWeeklyTarget] = useState(2400); // 40 hours in minutes
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);
  const [examInfo, setExamInfo] = useState<string>("");
  const [tasksData, setTasksData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    days: []
  });
  
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user settings
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (userSettings) {
        const weeklyTargetHours = userSettings.meta_horas_semanais || 40;
        setWeeklyTarget(weeklyTargetHours * 60); // Convert to minutes
        setDailyTarget(Math.round((weeklyTargetHours * 60) / 7)); // Daily target in minutes

        if (userSettings.data_prova) {
          const examDate = new Date(userSettings.data_prova);
          const today = new Date();
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysUntilExam(diffDays > 0 ? diffDays : 0);
        }

        if (userSettings.vestibular_pretendido) {
          setExamInfo(userSettings.vestibular_pretendido);
        }
      }
      
      // Fetch all study sessions to calculate total time
      const { data: studySessions, error: studyError } = await supabase
        .from('study_sessions')
        .select('study_time, date')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });
      
      if (studyError) throw studyError;
      
      // Calculate total minutes studied
      const totalMinutes = studySessions?.reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      setTotalStudyMinutes(totalMinutes);

      // Calculate weekly study minutes (last 7 days)
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      const weeklyMinutes = studySessions?.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= lastWeek;
      }).reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      
      setWeeklyStudyMinutes(weeklyMinutes);
      
      // Generate chart data from actual study sessions
      const last7Days = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        last7Days.push({
          date: dateStr,
          name: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][date.getDay()],
          dayOfWeek: date.getDay(),
          hours: 0,
          goal: Math.round(dailyTarget / 60 * 10) / 10 // Convert to hours with 1 decimal
        });
      }
      
      // Calculate hours studied for each day
      if (studySessions) {
        studySessions.forEach(session => {
          const day = last7Days.find(d => d.date === session.date);
          if (day) {
            // Convert minutes to hours with one decimal place
            day.hours += parseFloat((session.study_time / 60).toFixed(1));
          }
        });
      }
      
      // Format chart data
      const formattedChartData = last7Days.map(day => ({
        name: day.name,
        hours: parseFloat(day.hours.toFixed(1)), // Ensure hours is a number with one decimal
        goal: day.goal
      }));
      
      setChartData(formattedChartData);
      
      // Calculate streak data based on actual study sessions
      const streakDays = last7Days.map(day => {
        const hasStudied = studySessions?.some(session => session.date === day.date) || false;
        return {
          date: day.name,
          hasStudied
        };
      });
      
      // Calculate current streak
      let currentStreak = 0;
      for (let i = streakDays.length - 1; i >= 0; i--) {
        if (streakDays[i].hasStudied) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      setStreakData({
        currentStreak,
        days: streakDays
      });
      
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
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os dados do dashboard"
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

  const weeklyProgress = weeklyTarget > 0 ? Math.round((weeklyStudyMinutes / weeklyTarget) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Dashboard" subtitle="Bem-vindo(a) de volta!">
          <Button>Planejar Nova Sessão</Button>
        </PageTitle>
        <StudyTimeButton />
      </div>

      {/* Exam countdown banner */}
      {daysUntilExam !== null && examInfo && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{examInfo}</h3>
                  <p className="text-muted-foreground">
                    Faltam <span className="font-bold text-primary">{daysUntilExam} dias</span> para sua prova
                  </p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <StatCard
          title="Horas Estudadas Total"
          value={formatMinutesToHoursAndMinutes(totalStudyMinutes)}
          icon={<Clock className="h-5 w-5" />}
          description={`Acumulado desde o início`}
        />
        <StatCard
          title="Progresso Semanal"
          value={`${weeklyProgress}%`}
          icon={<Target className="h-5 w-5" />}
          description={`${formatMinutesToHoursAndMinutes(weeklyStudyMinutes)} de ${formatMinutesToHoursAndMinutes(weeklyTarget)}`}
          trend={{ value: weeklyProgress >= 100 ? 100 : weeklyProgress, isPositive: weeklyProgress >= 80 }}
        />
        <StatCard
          title="Total de Matérias"
          value="8"
          icon={<BookOpen className="h-5 w-5" />}
          description="2 matérias em dia"
        />
        <StatCard
          title="Streak Atual"
          value={`${streakData.currentStreak} dias`}
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
            <StudyChart data={loading ? [] : chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyStreak {...streakData} />
            <div className="mt-6">
              <SubjectProgress />
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
