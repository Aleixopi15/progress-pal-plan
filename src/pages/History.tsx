
import { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, History as HistoryIcon, Filter } from "lucide-react";
import { StatusBadge } from "@/components/subscription/StatusBadge";
import { useSubscription } from "@/lib/subscription";
import { RequireSubscription } from "@/components/subscription/RequireSubscription";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubscriptionHistoryItem {
  id: string;
  status: string; // Changed to string to fix TypeScript error
  stripe_subscription_id: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

interface StudySessionItem {
  id: string;
  date: string;
  registration_time: string;
  study_time: number;
  subject_id: string;
  subject_name?: string;
  topic_id: string | null;
  topic_name?: string;
  subtopic: string | null;
  lesson: string | null;
  correct_exercises: number | null;
  incorrect_exercises: number | null;
}

interface Subject {
  id: string;
  name: string;
}

export default function History() {
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [studySessions, setStudySessions] = useState<StudySessionItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { subscriptionData } = useSubscription();
  const [activeTab, setActiveTab] = useState("study");

  // Carrega o histórico de assinaturas
  useEffect(() => {
    const fetchSubscriptionHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("subscription_history")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setSubscriptionHistory(data || []);
      } catch (error) {
        console.error("Erro ao carregar histórico de assinaturas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionHistory();
  }, []);

  // Carrega matérias para filtro
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name")
          .order("name");

        if (error) {
          throw error;
        }

        setSubjects(data || []);
      } catch (error) {
        console.error("Erro ao carregar matérias:", error);
      }
    };

    fetchSubjects();
  }, []);

  // Carrega sessões de estudo
  useEffect(() => {
    const fetchStudySessions = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("study_sessions")
          .select(`
            id, date, registration_time, study_time,
            subject_id, topic_id, subtopic, lesson,
            correct_exercises, incorrect_exercises
          `)
          .order("date", { ascending: false });
          
        // Filtra por matéria se selecionada
        if (selectedSubject !== "all") {
          query = query.eq("subject_id", selectedSubject);
        }
        
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          // Busca nomes de matérias
          const subjectIds = [...new Set(data.map(session => session.subject_id))];
          const { data: subjectsData, error: subjectsError } = await supabase
            .from("subjects")
            .select("id, name")
            .in("id", subjectIds);
            
          if (subjectsError) throw subjectsError;
          
          // Busca nomes de tópicos
          const topicIds = [...new Set(data.map(session => session.topic_id).filter(Boolean))];
          const { data: topicsData, error: topicsError } = topicIds.length > 0 ? 
            await supabase
              .from("topics")
              .select("id, name")
              .in("id", topicIds)
            : { data: [], error: null };
            
          if (topicsError) throw topicsError;
          
          // Adiciona nomes às sessões
          const enhancedData = data.map(session => {
            const subjectName = subjectsData?.find(s => s.id === session.subject_id)?.name;
            const topicName = session.topic_id ? 
              topicsData?.find(t => t.id === session.topic_id)?.name : null;
              
            return {
              ...session,
              subject_name: subjectName,
              topic_name: topicName
            };
          });
          
          setStudySessions(enhancedData);
        } else {
          setStudySessions([]);
        }
      } catch (error) {
        console.error("Erro ao carregar sessões de estudo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudySessions();
  }, [selectedSubject]);

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não disponível";
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };
  
  // Formatar hora
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Não disponível";
    return timeString.substring(0, 5); // Retorna apenas HH:MM
  };
  
  // Formatar duração
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'min' : ''}`;
    }
    return `${mins}min`;
  };

  return (
    <RequireSubscription>
      <div className="animate-fade-in">
        <PageTitle 
          title="Histórico" 
          subtitle="Visualize seu histórico de sessões de estudo e assinatura"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="study" className="flex items-center gap-2">
              <HistoryIcon size={16} />
              <span>Sessões de Estudo</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <HistoryIcon size={16} />
              <span>Assinatura</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Sessões de Estudo */}
          <TabsContent value="study">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold">Histórico de Sessões de Estudo</h2>
                
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-muted-foreground" />
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as matérias</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : studySessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Matéria</TableHead>
                        <TableHead>Tópico/Subtópico</TableHead>
                        <TableHead>Tempo de Estudo</TableHead>
                        <TableHead>Exercícios</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studySessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>{formatDate(session.date)}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatTime(session.registration_time)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.subject_name || "Não disponível"}
                          </TableCell>
                          <TableCell>
                            <div>
                              {session.topic_name || "Sem tópico"}
                              {session.subtopic && (
                                <span className="block text-xs text-muted-foreground">
                                  {session.subtopic}
                                </span>
                              )}
                            </div>
                            {session.lesson && (
                              <div className="text-xs text-muted-foreground">
                                Aula: {session.lesson}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {formatDuration(session.study_time)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.correct_exercises !== null || session.incorrect_exercises !== null ? (
                              <div>
                                <span className="text-green-500">
                                  {session.correct_exercises || 0} ✓
                                </span>
                                {" / "}
                                <span className="text-red-500">
                                  {session.incorrect_exercises || 0} ✗
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Não informados</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sessão de estudo encontrada
                  {selectedSubject !== "all" && " para esta matéria"}
                </div>
              )}
            </Card>
          </TabsContent>
          
          {/* Tab de Assinatura */}
          <TabsContent value="subscription">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Status atual da assinatura</h2>
              <div className="flex items-center space-x-2 mb-6">
                <StatusBadge status={subscriptionData.subscription_status} />
                {subscriptionData.current_period_end && (
                  <span className="text-sm text-muted-foreground">
                    Válida até: {formatDate(subscriptionData.current_period_end)}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-semibold mb-4">Histórico de transações</h2>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : subscriptionHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>ID da assinatura</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Período de validade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{formatDate(item.created_at)}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.stripe_subscription_id}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>
                            {item.current_period_start && item.current_period_end
                              ? `${formatDate(item.current_period_start)} até ${formatDate(item.current_period_end)}`
                              : "Não disponível"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum histórico de assinatura encontrado
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RequireSubscription>
  );
}
