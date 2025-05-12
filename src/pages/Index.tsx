
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress"; 
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
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
    <DashboardLayout>
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
          <StudyChart />
        </div>
        <div className="col-span-full lg:col-span-3">
          <StudyStreak />
        </div>
        <div className="col-span-full lg:col-span-4">
          <SubjectProgress />
        </div>
        <div className="col-span-full lg:col-span-3">
          <StudyTasks />
        </div>
        <div className="col-span-full">
          <NextStudySessions />
        </div>
      </div>
    </DashboardLayout>
  );
}
