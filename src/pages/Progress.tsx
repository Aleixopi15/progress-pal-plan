
import React, { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { BarChart, BarChart2, BookOpen, Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, 
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";

export default function Progress() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [studyStats, setStudyStats] = useState({
    totalHours: 0,
    studyDays: 0,
    subjectsCount: 0,
    overallProgress: 0,
    weeklyData: [],
    subjectTimeDistribution: [],
    simulationScores: [],
    questionStats: { total: 0, correct: 0 },
    topicsStats: { total: 0, completed: 0 }
  });
  
  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all subjects with their progress
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");
        
      if (subjectsError) throw subjectsError;
      
      // 2. Fetch all topics to calculate subject progress
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select("id, subject_id, is_completed")
        .eq("user_id", user?.id);
        
      if (topicsError) throw topicsError;
      
      // 3. Fetch all questions to calculate correctness ratio
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("id, topic_id, is_correct")
        .eq("user_id", user?.id);
        
      if (questionsError) throw questionsError;
      
      // 4. Fetch all study sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select("study_time, date, subject_id")
        .eq("user_id", user?.id)
        .order("date");
        
      if (sessionsError) throw sessionsError;

      // 5. Fetch simulados data
      const { data: simuladosData, error: simuladosError } = await supabase
        .from("simulados")
        .select("nota_total, data")
        .eq("user_id", user?.id)
        .order("data", { ascending: false })
        .limit(10);
        
      if (simuladosError) throw simuladosError;
      
      // Calculate subjects with progress based on completed topics
      const subjectsWithProgress = subjectsData.map(subject => {
        // Get topics for this subject
        const subjectTopics = topicsData.filter(topic => topic.subject_id === subject.id);
        const totalTopics = subjectTopics.length;
        const completedTopics = subjectTopics.filter(topic => topic.is_completed).length;
        
        // Get questions for these topics
        const topicIds = subjectTopics.map(topic => topic.id);
        const subjectQuestions = questionsData.filter(q => topicIds.includes(q.topic_id));
        const totalQuestions = subjectQuestions.length;
        const correctQuestions = subjectQuestions.filter(q => q.is_correct).length;
        
        // Calculate progress based on completed topics
        const progress = totalTopics > 0 
          ? Math.round((completedTopics / totalTopics) * 100) 
          : 0;
        
        return {
          id: subject.id,
          name: subject.name,
          progress,
          totalTopics,
          completedTopics,
          totalQuestions,
          correctQuestions
        };
      });
      
      setSubjects(subjectsWithProgress);
      
      // Calculate total study hours
      const totalMinutes = sessionsData.reduce((sum, session) => sum + (session.study_time || 0), 0);
      const totalHours = parseFloat((totalMinutes / 60).toFixed(1));
      
      // Count distinct study days
      const uniqueDays = new Set(sessionsData.map(session => session.date)).size;
      
      // Calculate topics stats
      const totalTopics = topicsData.length;
      const completedTopics = topicsData.filter(topic => topic.is_completed).length;
      const topicsProgress = totalTopics > 0 
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;
      
      // Calculate questions stats
      const totalQuestions = questionsData.length;
      const correctQuestions = questionsData.filter(q => q.is_correct).length;
      const overallProgress = totalQuestions > 0 
        ? Math.round((correctQuestions / totalQuestions) * 100)
        : topicsProgress; // Use topics progress if no questions
      
      // Process weekly data
      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weeklyData = weekDays.map(day => ({ day, hours: 0 }));
      
      // Fill in actual study hours by day of week
      sessionsData.forEach(session => {
        const sessionDate = new Date(session.date);
        const dayOfWeek = sessionDate.getDay();
        const hours = session.study_time / 60;
        
        weeklyData[dayOfWeek].hours += hours;
      });
      
      // Round hours to one decimal place
      weeklyData.forEach(day => {
        day.hours = parseFloat(day.hours.toFixed(1));
      });
      
      // Calculate time distribution by subject
      const subjectTimeMap = {};
      sessionsData.forEach(session => {
        if (!subjectTimeMap[session.subject_id]) {
          subjectTimeMap[session.subject_id] = 0;
        }
        subjectTimeMap[session.subject_id] += session.study_time;
      });
      
      const subjectTimeDistribution = subjectsData.map(subject => {
        const minutes = subjectTimeMap[subject.id] || 0;
        const hours = parseFloat((minutes / 60).toFixed(1));
        return {
          subject: subject.name.substring(0, 3), // First 3 chars as abbreviation
          hours
        };
      }).sort((a, b) => b.hours - a.hours); // Sort by hours descending
      
      // Process simulados scores for chart
      const simulationScores = simuladosData.map((simulado, index) => ({
        simulado: `Sim ${index + 1}`,
        score: simulado.nota_total || 0
      }));
      
      // Update all progress stats
      setStudyStats({
        totalHours,
        studyDays: uniqueDays,
        subjectsCount: subjectsData.length,
        overallProgress,
        weeklyData,
        subjectTimeDistribution,
        simulationScores,
        questionStats: { total: totalQuestions, correct: correctQuestions },
        topicsStats: { total: totalTopics, completed: completedTopics }
      });
      
    } catch (error) {
      console.error("Error fetching progress data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados de progresso",
        description: "Não foi possível obter as estatísticas de progresso"
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageTitle title="Progresso" subtitle="Acompanhe sua evolução nos estudos" />
        <div className="mt-6 flex justify-center">
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <PageTitle title="Progresso" subtitle="Acompanhe sua evolução nos estudos" />
      
      {/* Estatísticas principais */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{studyStats.totalHours}h</h3>
              <p className="text-sm text-muted-foreground">Horas Totais</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{studyStats.topicsStats.completed}/{studyStats.topicsStats.total}</h3>
              <p className="text-sm text-muted-foreground">Tópicos Concluídos</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4">
              <Target className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{studyStats.questionStats.correct}/{studyStats.questionStats.total}</h3>
              <p className="text-sm text-muted-foreground">Questões Corretas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{studyStats.overallProgress}%</h3>
              <p className="text-sm text-muted-foreground">Progresso Geral</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content with real progress statistics */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Disciplina</CardTitle>
            <CardDescription>Baseado em tópicos concluídos</CardDescription>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma matéria encontrada</h3>
                <p className="text-muted-foreground">
                  Adicione matérias para começar a acompanhar seu progresso
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {subjects.map(subject => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{subject.name}</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <ProgressBar value={subject.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {subject.completedTopics} de {subject.totalTopics} tópicos concluídos
                      {subject.totalQuestions > 0 && ` • ${subject.correctQuestions} de ${subject.totalQuestions} questões corretas`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Horas de Estudo por Dia</CardTitle>
              <CardDescription>Distribuição semanal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={studyStats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value} horas`]} />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" name="Horas" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Desempenho em Simulados</CardTitle>
              <CardDescription>Últimos simulados realizados</CardDescription>
            </CardHeader>
            <CardContent>
              {studyStats.simulationScores.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={studyStats.simulationScores}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="simulado" axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 1000]} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} pontos`]} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      name="Pontuação" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">Nenhum simulado registrado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tempo por Matéria</CardTitle>
            <CardDescription>Horas por matéria</CardDescription>
          </CardHeader>
          <CardContent>
            {studyStats.subjectTimeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart
                  data={studyStats.subjectTimeDistribution}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="subject" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <Tooltip formatter={(value) => [`${value} horas`]} />
                  <Bar 
                    dataKey="hours" 
                    fill="hsl(var(--primary))" 
                    name="Horas" 
                    radius={[0, 4, 4, 0]} 
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">Ainda não há dados de estudo registrados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
