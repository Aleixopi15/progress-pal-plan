
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, BookOpen, Calendar, Clock, Eye } from "lucide-react";
import { SessionDetailDialog } from "@/components/history/SessionDetailDialog";

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

interface Subject {
  id: string;
  name: string;
}

export default function History() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Buscar sessões de estudo e matérias
  useEffect(() => {
    if (!user) return;
    
    async function fetchData() {
      try {
        setLoading(true);
        
        // Buscar matérias
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, name")
          .eq("user_id", user.id);
        
        if (subjectsError) throw subjectsError;
        
        // Buscar sessões de estudo
        const { data: sessionsData, error: sessionsError } = await supabase
          .from("study_sessions")
          .select(`
            id, date, registration_time, subject_id, topic_id, 
            subtopic, study_time, lesson, start_page, end_page,
            correct_exercises, incorrect_exercises, video_start_time,
            video_end_time, comment
          `)
          .eq("user_id", user.id)
          .order("date", { ascending: false });
        
        if (sessionsError) throw sessionsError;
        
        // Criar um mapa de matérias para facilitar busca
        const subjectMap = subjectsData.reduce((map, subject) => {
          map[subject.id] = subject.name;
          return map;
        }, {} as Record<string, string>);
        
        // Buscar nomes de tópicos para os IDs encontrados
        const topicIds = sessionsData
          .filter(session => session.topic_id)
          .map(session => session.topic_id);
          
        let topicMap: Record<string, string> = {};
        
        if (topicIds.length > 0) {
          const { data: topicsData, error: topicsError } = await supabase
            .from("topics")
            .select("id, name")
            .in("id", topicIds);
            
          if (!topicsError && topicsData) {
            topicMap = topicsData.reduce((map, topic) => {
              map[topic.id] = topic.name;
              return map;
            }, {} as Record<string, string>);
          }
        }
        
        // Enriquecer os dados das sessões com nomes de matérias e tópicos
        const enrichedSessions = sessionsData.map(session => ({
          ...session,
          subject_name: subjectMap[session.subject_id] || "Matéria não encontrada",
          topic_name: session.topic_id ? (topicMap[session.topic_id] || "Tópico não encontrado") : null
        }));
        
        setSessions(enrichedSessions);
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user]);

  // Filtrar sessões com base na aba e matéria selecionada
  const getFilteredSessions = () => {
    let filtered = [...sessions];
    
    // Filtrar por matéria
    if (selectedSubject !== "all") {
      filtered = filtered.filter(session => session.subject_id === selectedSubject);
    }
    
    // Filtrar por período
    const now = new Date();
    if (currentTab === "today") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(session => session.date === today);
    } else if (currentTab === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(session => new Date(session.date) >= oneWeekAgo);
    } else if (currentTab === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(session => new Date(session.date) >= oneMonthAgo);
    }
    
    return filtered;
  };
  
  const filteredSessions = getFilteredSessions();
  
  // Calcular estatísticas
  const totalMinutes = filteredSessions.reduce((sum, session) => sum + (session.study_time || 0), 0);
  const totalSessions = filteredSessions.length;
  const avgMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  
  // Formatar minutos para horas e minutos
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setDetailDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageTitle 
        title="Histórico de Estudos" 
        subtitle="Veja todo o seu histórico de sessões de estudo"
      />
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo Total de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{formatMinutes(totalMinutes)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sessões de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{totalSessions}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Média por Sessão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{formatMinutes(avgMinutesPerSession)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Última semana</TabsTrigger>
            <TabsTrigger value="month">Último mês</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="w-full sm:w-64">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as matérias</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid gap-2 md:grid-cols-4 items-start">
                  <div>
                    <h3 className="font-medium">{session.lesson || session.subtopic || "Sessão de estudo"}</h3>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <BookOpen className="mr-1 h-3 w-3" />
                      <span>{session.subject_name}</span>
                      {session.topic_name && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{session.topic_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 items-center">
                    <div className="flex items-center text-sm">
                      <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span>{formatMinutes(session.study_time || 0)}</span>
                    </div>
                    
                    {(session.correct_exercises || session.incorrect_exercises) && (
                      <div className="text-sm">
                        <span className="text-green-600">{session.correct_exercises || 0} acertos</span>
                        <span className="mx-1">•</span>
                        <span className="text-red-600">{session.incorrect_exercises || 0} erros</span>
                      </div>
                    )}
                    
                    {(session.start_page || session.end_page) && (
                      <div className="text-sm text-muted-foreground">
                        Páginas: {session.start_page || 0} - {session.end_page || 0}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {formatDate(session.date)}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(session)}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-medium">Nenhuma sessão de estudo</h3>
          <p className="text-muted-foreground mt-1">
            {currentTab === "all" && selectedSubject === "all" 
              ? "Nenhuma sessão de estudo foi registrada. Comece a estudar para ver seu histórico aqui."
              : "Nenhuma sessão de estudo foi encontrada para os filtros selecionados."}
          </p>
        </div>
      )}

      <SessionDetailDialog
        session={selectedSession}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
