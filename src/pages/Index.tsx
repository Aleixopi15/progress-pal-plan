
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { QuestionsStats } from "@/components/dashboard/QuestionsStats";
import { StudyStreakCard } from "@/components/dashboard/StudyStreakCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyTimeButton } from "@/components/study/StudyTimeButton";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { SessionDetailDialog } from "@/components/history/SessionDetailDialog";
import { GoalNotifications } from "@/components/goals/GoalNotifications";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Target } from "lucide-react";

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

export default function Index() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [studyData, setStudyData] = useState({
    totalMinutes: 0,
    totalQuestions: 0,
    correctPercentage: 0,
    chartData: []
  });
  const [userSettings, setUserSettings] = useState({
    daysUntilExam: null,
    examName: "",
    weeklyGoal: 40,
    weeklyProgress: 0
  });
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch user settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (settings) {
        let daysUntilExam = null;
        if (settings.data_prova) {
          const examDate = new Date(settings.data_prova);
          const today = new Date();
          const diffTime = examDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          daysUntilExam = diffDays > 0 ? diffDays : 0;
        }

        setUserSettings({
          daysUntilExam,
          examName: settings.vestibular_pretendido || "",
          weeklyGoal: settings.meta_horas_semanais || 40,
          weeklyProgress: 0
        });
      }
      
      // Fetch study sessions data for stats
      const { data: studySessions, error: sessionsError } = await supabase
        .from("study_sessions")
        .select(`
          id, subject_id, topic_id, date, registration_time,
          subtopic, study_time, lesson, correct_exercises,
          incorrect_exercises, start_page, end_page, comment,
          video_start_time, video_end_time
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
        
      if (sessionsError) throw sessionsError;

      // Calculate total study minutes
      const totalMinutes = studySessions?.reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      
      // Calculate weekly study minutes (last 7 days)
      const today = new Date();
      const lastWeek = new Date();
      lastWeek.setDate(today.getDate() - 7);
      
      const weeklyMinutes = studySessions?.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= lastWeek;
      }).reduce((sum, session) => sum + (session.study_time || 0), 0) || 0;
      
      const weeklyProgress = userSettings.weeklyGoal > 0 ? Math.round((weeklyMinutes / (userSettings.weeklyGoal * 60)) * 100) : 0;
      
      setUserSettings(prev => ({ ...prev, weeklyProgress }));
      
      // Fetch questions data
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("id, is_correct")
        .eq("user_id", user?.id);
        
      if (questionsError) throw questionsError;
      
      // Calculate questions stats
      const totalQuestions = questions?.length || 0;
      const correctQuestions = questions?.filter(q => q.is_correct)?.length || 0;
      const correctPercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
      
      // Generate chart data from actual study sessions
      const getDayInitials = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const last7Days = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return date;
      });
      
      const chartData = last7Days.map((date) => {
        const dayIndex = date.getDay();
        const dayFormatted = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Filter sessions for this day
        const dayStudySessions = studySessions?.filter(session => 
          session.date === dayFormatted
        ) || [];
        
        // Calculate hours studied on this day
        const minutesStudied = dayStudySessions.reduce((sum, session) => 
          sum + (session.study_time || 0), 0);
        const hoursStudied = minutesStudied / 60;
        
        return {
          name: getDayInitials[dayIndex],
          hours: Number(hoursStudied.toFixed(1)),
          goal: dayIndex === 0 || dayIndex === 6 ? 2 : 4 // Weekend vs weekday goals
        };
      });
      
      // Format recent study sessions with subject names
      const recentSessions = studySessions?.slice(0, 5) || [];
      
      // Get subject names for the sessions
      if (recentSessions.length > 0) {
        const subjectIds = [...new Set(recentSessions.map(s => s.subject_id).filter(Boolean))];
        
        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("id, name")
          .in("id", subjectIds);
          
        const subjectsMap = new Map(subjectsData?.map(s => [s.id, s.name]) || []);
        
        // Get topic names for sessions that have topic_id
        const topicIds = [...new Set(recentSessions.map(s => s.topic_id).filter(Boolean))];
        let topicsMap = new Map();
        
        if (topicIds.length > 0) {
          const { data: topicsData } = await supabase
            .from("topics")
            .select("id, name")
            .in("id", topicIds);
          
          topicsMap = new Map(topicsData?.map(t => [t.id, t.name]) || []);
        }
        
        const formattedSessions = recentSessions.map(session => ({
          id: session.id,
          title: session.lesson || session.subtopic || "Sessão de estudo",
          subject: subjectsMap.get(session.subject_id) || "Matéria",
          date: new Date(session.date).toLocaleDateString("pt-BR"),
          time: session.registration_time ? session.registration_time.slice(0, 5) : "", // Format HH:MM
          duration: `${session.study_time} min`
        }));
        
        setSessions(formattedSessions);
      }
      
      // Set all data
      setStudyData({
        totalMinutes,
        totalQuestions,
        correctPercentage,
        chartData
      });
      
      // Use the most recent study sessions as tasks
      setTasks(
        recentSessions?.slice(0, 3).map(session => ({
          id: session.id,
          title: session.lesson || session.subtopic || "Sessão de estudo",
          subject: "Matéria",
          time: session.registration_time ? session.registration_time.slice(0, 5) : "",
          duration: `${session.study_time} min`,
          status: "completed"
        })) || []
      );
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const handleStudyTimeAdded = () => {
    // Recarrega os dados do dashboard quando uma nova sessão de estudo é adicionada
    fetchDashboardData();
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

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.user_metadata?.nome || 'Estudante'}</h1>
          <p className="text-muted-foreground">Veja seu progresso e continue os estudos</p>
        </div>
        <StudyTimeButton onStudyTimeAdded={handleStudyTimeAdded} />
      </div>

      {/* Goal notifications */}
      <GoalNotifications />

      {/* Exam countdown and goals */}
      {(userSettings.daysUntilExam !== null || userSettings.weeklyGoal) && (
        <div className="grid gap-4 md:grid-cols-2">
          {userSettings.daysUntilExam !== null && userSettings.examName && (
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold">{userSettings.examName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Faltam <span className="font-bold text-primary">{userSettings.daysUntilExam} dias</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-secondary" />
                <div>
                  <h3 className="font-semibold">Meta Semanal</h3>
                  <p className="text-sm text-muted-foreground">
                    {userSettings.weeklyProgress}% de {userSettings.weeklyGoal}h concluída
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adiciona o banner de assinatura quando necessário */}
      <SubscriptionBanner />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Horas de Estudo" 
          value={formatMinutesToHoursAndMinutes(studyData.totalMinutes)} 
          description="Total acumulado" 
        />
        <StatCard 
          title="Questões" 
          value={studyData.totalQuestions.toString()} 
          description="Resolvidas" 
        />
        <StatCard 
          title="Aproveitamento" 
          value={`${studyData.correctPercentage}%`} 
          description="de acertos" 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StudyStreakCard />
        <StudyChart data={studyData.chartData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuestionsStats />
        <NextStudySessions sessions={sessions} onViewDetails={handleViewSessionDetails} />
        <SubjectProgress />
      </div>

      <StudyTasks tasks={tasks} />

      <SessionDetailDialog
        session={selectedSession}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
