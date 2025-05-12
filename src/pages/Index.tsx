
import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress"; 
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { QuestionsStats } from "@/components/dashboard/QuestionsStats";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalSubjects: number;
  totalTopics: number;
  totalNotes: number;
  totalQuestions: number;
  correctQuestions: number;
}

export default function Index() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSubjects: 0,
    totalTopics: 0,
    totalNotes: 0,
    totalQuestions: 0,
    correctQuestions: 0
  });
  const [loading, setLoading] = useState(true);

  // Dados de exemplo para os gráficos e componentes
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

  const tasks = [
    {
      id: "1",
      title: "Revisão de Matemática",
      subject: "Matemática",
      time: "09:00 - 10:30",
      duration: "1h 30min",
      status: "completed" as const,
    },
    {
      id: "2",
      title: "Exercícios de Física",
      subject: "Física",
      time: "11:00 - 12:30",
      duration: "1h 30min",
      status: "upcoming" as const,
    },
    {
      id: "3",
      title: "Leitura de História",
      subject: "História",
      time: "14:00 - 15:30",
      duration: "1h 30min",
      status: "upcoming" as const,
    },
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

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Buscar contagem de matérias
      const { count: subjectsCount } = await supabase
        .from("subjects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      // Buscar contagem de tópicos
      const { count: topicsCount } = await supabase
        .from("topics")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      // Buscar contagem de anotações
      const { count: notesCount } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id);
      
      // Buscar contagem de questões
      const { data: questions, count: questionsCount } = await supabase
        .from("questions")
        .select("*", { count: "exact" })
        .eq("user_id", user?.id);
      
      // Calcular questões corretas
      const correctQuestionsCount = questions?.filter(q => q.is_correct)?.length || 0;
      
      setStats({
        totalSubjects: subjectsCount || 0,
        totalTopics: topicsCount || 0,
        totalNotes: notesCount || 0,
        totalQuestions: questionsCount || 0,
        correctQuestions: correctQuestionsCount
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Matérias" 
          value={loading ? "-" : `${stats.totalSubjects}`} 
          description="Total de matérias" 
        />
        <StatCard 
          title="Tópicos" 
          value={loading ? "-" : `${stats.totalTopics}`} 
          description="Total de tópicos" 
        />
        <StatCard 
          title="Anotações" 
          value={loading ? "-" : `${stats.totalNotes}`} 
          description="Total de anotações" 
        />
        <StatCard 
          title="Aproveitamento" 
          value={loading || stats.totalQuestions === 0 ? "-" : `${Math.round((stats.correctQuestions / stats.totalQuestions) * 100)}%`} 
          description={`${stats.correctQuestions} de ${stats.totalQuestions} questões corretas`} 
        />
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <StudyChart data={chartData} />
        </div>
        <div className="col-span-full lg:col-span-3">
          <StudyStreak currentStreak={streakData.currentStreak} days={streakData.days} />
        </div>
        <div className="col-span-full lg:col-span-4">
          <SubjectProgress />
        </div>
        <div className="col-span-full lg:col-span-3">
          <QuestionsStats />
        </div>
        <div className="col-span-full lg:col-span-4">
          <StudyTasks tasks={tasks} />
        </div>
        <div className="col-span-full lg:col-span-3">
          <NextStudySessions sessions={nextSessions} />
        </div>
      </div>
    </div>
  );
}
