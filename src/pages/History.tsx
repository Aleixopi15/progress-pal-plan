
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/subscription/StatusBadge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { Check, X, Clock, BookOpen } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SubscriptionStatus } from "@/lib/subscription";

// Interfaces
interface StudySession {
  id: string;
  date: string;
  study_time: number;
  subject_id: string;
  subject_name?: string;
  topic_id: string | null;
  topic_name?: string;
  comment: string | null;
}

interface Question {
  id: string;
  content: string;
  is_correct: boolean;
  topic_id: string;
  topic_name?: string;
  created_at: string;
  subject_id?: string;
  subject_name?: string;
}

interface Subject {
  id: string;
  name: string;
}

interface SubscriptionHistoryItem {
  id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  price_id: string | null;
  created_at: string;
}

export default function History() {
  const [activeTab, setActiveTab] = useState("study");
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loadingStudy, setLoadingStudy] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchStudySessions();
      fetchQuestions();
      fetchSubscriptionHistory();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar matérias",
        description: error.message
      });
    }
  };

  const fetchStudySessions = async () => {
    try {
      setLoadingStudy(true);
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("study_sessions")
        .select(`
          *,
          subjects:subject_id (name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      if (sessionsError) throw sessionsError;

      // Transform data to include subject name
      const formattedSessions = sessionsData.map(session => ({
        ...session,
        subject_name: session.subjects?.name
      }));

      setStudySessions(formattedSessions);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar sessões de estudo",
        description: error.message
      });
    } finally {
      setLoadingStudy(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      
      // First get all questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select(`
          id, 
          content, 
          is_correct,
          topic_id, 
          created_at
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (questionsError) throw questionsError;

      if (questionsData.length === 0) {
        setQuestions([]);
        return;
      }

      // Get all topics involved
      const topicIds = [...new Set(questionsData.map(q => q.topic_id))];
      
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          subject_id
        `)
        .in("id", topicIds);

      if (topicsError) throw topicsError;

      // Get all subjects involved
      const subjectIds = [...new Set(topicsData.map(t => t.subject_id))];
      
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select(`
          id,
          name
        `)
        .in("id", subjectIds);

      if (subjectsError) throw subjectsError;

      // Map topic names and subject info to questions
      const enrichedQuestions = questionsData.map(question => {
        const topic = topicsData.find(t => t.id === question.topic_id);
        const subject = topic ? subjectsData.find(s => s.id === topic.subject_id) : null;
        
        return {
          ...question,
          topic_name: topic?.name || "Desconhecido",
          subject_id: subject?.id || undefined,
          subject_name: subject?.name || "Desconhecido"
        };
      });

      setQuestions(enrichedQuestions);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar questões",
        description: error.message
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchSubscriptionHistory = async () => {
    try {
      setLoadingSubscription(true);
      
      const { data, error } = await supabase
        .from("subscription_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setSubscriptionHistory(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar histórico de assinatura",
        description: error.message
      });
    } finally {
      setLoadingSubscription(false);
    }
  };

  // Filter study sessions by selected subject
  const filteredStudySessions = selectedSubjectId
    ? studySessions.filter(session => session.subject_id === selectedSubjectId)
    : studySessions;

  // Filter questions by selected subject  
  const filteredQuestions = selectedSubjectId
    ? questions.filter(question => question.subject_id === selectedSubjectId)
    : questions;

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const formatSubscriptionStatus = (status: string): SubscriptionStatus => {
    // Map the string status to the SubscriptionStatus enum
    switch(status) {
      case "active":
        return "active";
      case "canceled":
        return "canceled";
      case "incomplete":
        return "pending";
      case "incomplete_expired":
        return "expired";
      case "past_due":
        return "past_due";
      case "trialing":
        return "active"; // Map trialing to active
      case "unpaid":
        return "past_due"; // Map unpaid to past_due
      default:
        return "inactive";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <PageTitle 
          title="Histórico" 
          subtitle="Acompanhe seu progresso ao longo do tempo"
        />

        <div className="flex justify-end">
          <div className="w-full max-w-xs">
            <Select 
              value={selectedSubjectId || ""} 
              onValueChange={(value) => setSelectedSubjectId(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as matérias</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="study">Sessões de Estudo</TabsTrigger>
            <TabsTrigger value="questions">Questões</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>
          
          {/* Sessões de Estudo */}
          <TabsContent value="study">
            <Card>
              <CardHeader>
                <CardTitle>Sessões de Estudo</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStudy ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : filteredStudySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      {selectedSubjectId ? "Nenhuma sessão para esta matéria" : "Nenhuma sessão de estudo encontrada"}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedSubjectId ? "Selecione outra matéria ou remova o filtro" : "Registre seu tempo de estudo para começar a acompanhar seu progresso"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Matéria</TableHead>
                          <TableHead>Tempo</TableHead>
                          <TableHead>Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudySessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              {format(new Date(session.date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{session.subject_name}</TableCell>
                            <TableCell>{formatMinutes(session.study_time)}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {session.comment || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Questões */}
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Questões</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingQuestions ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">
                      {selectedSubjectId ? "Nenhuma questão para esta matéria" : "Nenhuma questão encontrada"}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedSubjectId ? "Selecione outra matéria ou remova o filtro" : "Adicione questões em seus tópicos para começar a acompanhar seu progresso"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Matéria</TableHead>
                          <TableHead>Tópico</TableHead>
                          <TableHead>Resultado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredQuestions.map((question) => (
                          <TableRow key={question.id}>
                            <TableCell>
                              {format(new Date(question.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>{question.subject_name}</TableCell>
                            <TableCell>{question.topic_name}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {question.is_correct ? (
                                  <Check className="h-5 w-5 text-green-600 mr-1" />
                                ) : (
                                  <X className="h-5 w-5 text-red-600 mr-1" />
                                )}
                                {question.is_correct ? "Acerto" : "Erro"}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Assinatura */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSubscription ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : subscriptionHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium">Nenhum histórico de assinatura</h3>
                    <p className="text-muted-foreground">
                      Seu histórico de assinatura aparecerá aqui
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>ID da Assinatura</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptionHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {format(new Date(item.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={formatSubscriptionStatus(item.status)} />
                            </TableCell>
                            <TableCell>
                              {item.current_period_start && item.current_period_end ? (
                                <>
                                  {format(new Date(item.current_period_start), "dd/MM/yy")} {" - "}
                                  {format(new Date(item.current_period_end), "dd/MM/yy")}
                                </>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {item.stripe_subscription_id}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
