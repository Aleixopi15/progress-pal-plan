
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { StudyStreakCard } from "@/components/dashboard/StudyStreakCard";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { RecentStudySessions } from "@/components/dashboard/RecentStudySessions";
import { DailyGoalsCard } from "@/components/dashboard/DailyGoalsCard";
import { SessionDetailDialog } from "@/components/history/SessionDetailDialog";
import { Clock, BookOpen, Target, Award, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";
import { useToast } from "@/components/ui/use-toast";
import { StudyTimeButton } from "@/components/study/StudyTimeButton";

interface Session {
  id: string;
  date: string;
  registration_time: string;
  subject_id: string;
  topic_id: string | null;
  subtopic: string | null;
  study_time: number;
  lesson: string | null;
  start_page: number | null;
  end_page: number | null;
  correct_exercises: number | null;
  incorrect_exercises: number | null;
  video_start_time: string | null;
  video_end_time: string | null;
  comment: string | null;
  subject_name: string;
  topic_name: string | null;
}

// Função para obter a data local no formato correto
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para obter o dia da semana correto considerando fuso horário local
const getLocalDayOfWeek = (date = new Date()) => {
  return date.getDay();
};

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
  const [chartData, setChartData] = useState([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
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
        const dailyTargetHours = userSettings.meta_horas_diarias || 6;
        
        setWeeklyTarget(weeklyTargetHours * 60); // Convert to minutes
        setDailyTarget(dailyTargetHours * 60); // Convert to minutes

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

      // Calculate weekly study minutes (last 7 days) - usando data local
      const today = new Date();
      const last7DaysLocal = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        last7DaysLocal.push(getLocalDateString(date));
      }
      
      const weeklyMinutes = studySessions?.filter(session => {
        return last7DaysLocal.includes(session.date);
      }).reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      
      setWeeklyStudyMinutes(weeklyMinutes);
      
      // Generate chart data from actual study sessions - corrigindo dias da semana
      const chartDataArray = [];
      const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date);
        const dayOfWeek = getLocalDayOfWeek(date);
        
        // Calcular horas estudadas neste dia
        const dayStudyMinutes = studySessions?.filter(session => 
          session.date === dateStr
        ).reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
        
        const hoursStudied = dayStudyMinutes / 60;
        
        chartDataArray.push({
          name: dayLabels[dayOfWeek],
          hours: Number(hoursStudied.toFixed(1)),
          goal: Number((dailyTarget / 60).toFixed(1)) // Meta diária em horas
        });
      }
      
      setChartData(chartDataArray);
      
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

  const handleViewSessionDetails = async (sessionId: string) => {
    try {
      const { data: session, error } = await supabase
        .from('study_sessions')
        .select(`
          id, date, registration_time, subject_id, topic_id, 
          subtopic, study_time, lesson, start_page, end_page,
          correct_exercises, incorrect_exercises, video_start_time,
          video_end_time, comment
        `)
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      // Get subject name
      const { data: subject } = await supabase
        .from('subjects')
        .select('name')
        .eq('id', session.subject_id)
        .single();

      // Get topic name if exists
      let topicName = null;
      if (session.topic_id) {
        const { data: topic } = await supabase
          .from('topics')
          .select('name')
          .eq('id', session.topic_id)
          .single();
        topicName = topic?.name || null;
      }

      const enrichedSession = {
        ...session,
        subject_name: subject?.name || "Matéria não encontrada",
        topic_name: topicName
      };

      setSelectedSession(enrichedSession);
      setDetailDialogOpen(true);
    } catch (error) {
      console.error("Error fetching session details:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes da sessão."
      });
    }
  };

  const weeklyProgress = weeklyTarget > 0 ? Math.round((weeklyStudyMinutes / weeklyTarget) * 100) : 0;

  return (
    <div className="animate-fade-in p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageTitle title="Dashboard" subtitle="Bem-vindo(a) de volta!" />
        <StudyTimeButton />
      </div>

      {/* Exam countdown banner */}
      {daysUntilExam !== null && examInfo && (
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold">{examInfo}</h3>
                  <p className="text-muted-foreground">
                    Faltam <span className="font-bold text-primary">{daysUntilExam} dias</span> para sua prova
                  </p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6 text-secondary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          title="Sequência"
          value="7 dias"
          icon={<Award className="h-5 w-5" />}
          description="Melhor: 14 dias"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horas de Estudo na Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyChart data={loading ? [] : chartData} />
          </CardContent>
        </Card>

        <StudyStreakCard />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyGoalsCard />
        </div>
        <div>
          <RecentStudySessions 
            sessions={[]} 
            onViewDetails={handleViewSessionDetails}
          />
        </div>
      </div>

      <SessionDetailDialog
        session={selectedSession}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
