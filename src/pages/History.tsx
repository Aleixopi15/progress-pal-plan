
import React, { useState, useEffect } from "react";
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
import { BookOpen, Check, Clock, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SubscriptionStatus } from "@/lib/subscription";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";

// Define interfaces for our data types
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
      console.log("Fetching data for user:", user.id);
      fetchSubjects();
    }
  }, [user]);

  // When user or activeTab changes, fetch the appropriate data
  useEffect(() => {
    if (user) {
      switch(activeTab) {
        case "study":
          fetchStudySessions();
          break;
        case "questions":
          fetchQuestions();
          break;
        case "subscription":
          fetchSubscriptionHistory();
          break;
      }
    }
  }, [user, activeTab]);

  // Effect to refetch data when subject filter changes
  useEffect(() => {
    if (user && selectedSubjectId !== undefined) {
      if (activeTab === "study") {
        fetchStudySessions();
      } else if (activeTab === "questions") {
        fetchQuestions();
      }
    }
  }, [selectedSubjectId, activeTab]);

  const fetchSubjects = async () => {
    try {
      console.log("Fetching subjects...");
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      console.log("Subjects fetched:", data);
      setSubjects(data || []);
    } catch (error: any) {
      console.error("Error fetching subjects:", error);
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
      console.log("Fetching study sessions...");
      
      let query = supabase
        .from("study_sessions")
        .select(`
          *,
          subjects:subject_id (name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false });
      
      // Apply subject filter if selected
      if (selectedSubjectId) {
        console.log("Filtering by subject:", selectedSubjectId);
        query = query.eq("subject_id", selectedSubjectId);
      }

      const { data: sessionsData, error: sessionsError } = await query;
      
      if (sessionsError) throw sessionsError;

      console.log("Study sessions fetched:", sessionsData);

      // Transform data to include subject name
      const formattedSessions = sessionsData.map(session => ({
        ...session,
        subject_name: session.subjects?.name
      }));

      setStudySessions(formattedSessions);
    } catch (error: any) {
      console.error("Error fetching study sessions:", error);
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
      console.log("Fetching questions...");
      
      // First get all questions
      let query = supabase
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
      
      // Apply subject filter if selected and we have topics data
      if (selectedSubjectId) {
        console.log("Filtering questions by subject:", selectedSubjectId);
        // We need to get topic IDs for the selected subject first
        const { data: topicsData } = await supabase
          .from("topics")
          .select("id")
          .eq("subject_id", selectedSubjectId);
        
        if (topicsData && topicsData.length > 0) {
          const topicIds = topicsData.map(t => t.id);
          console.log("Filtering by topics:", topicIds);
          query = query.in("topic_id", topicIds);
        } else {
          // If no topics found for this subject, return empty result
          console.log("No topics found for subject, returning empty result");
          setQuestions([]);
          setLoadingQuestions(false);
          return;
        }
      }

      const { data: questionsData, error: questionsError } = await query;
      
      if (questionsError) throw questionsError;
      console.log("Questions fetched:", questionsData);

      if (!questionsData || questionsData.length === 0) {
        setQuestions([]);
        setLoadingQuestions(false);
        return;
      }

      // Get all topics involved
      const topicIds = [...new Set(questionsData.map(q => q.topic_id))];
      console.log("Getting topic details for topics:", topicIds);
      
      const { data: topicsData, error: topicsError } = await supabase
        .from("topics")
        .select(`
          id,
          name,
          subject_id
        `)
        .in("id", topicIds);

      if (topicsError) throw topicsError;
      console.log("Topics fetched:", topicsData);

      // Get all subjects involved
      const subjectIds = [...new Set(topicsData.map(t => t.subject_id))];
      console.log("Getting subject details for subjects:", subjectIds);
      
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select(`
          id,
          name
        `)
        .in("id", subjectIds);

      if (subjectsError) throw subjectsError;
      console.log("Subjects fetched for questions:", subjectsData);

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

      console.log("Enriched questions:", enrichedQuestions);
      setQuestions(enrichedQuestions);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
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
      console.log("Fetching subscription history...");
      
      const { data, error } = await supabase
        .from("subscription_history")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      console.log("Subscription history fetched:", data);
      
      setSubscriptionHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching subscription history:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar histórico de assinatura",
        description: error.message
      });
    } finally {
      setLoadingSubscription(false);
    }
  };

  const formatSubscriptionStatus = (status: string): SubscriptionStatus => {
    switch(status) {
      case "active":
        return "active";
      case "canceled":
        return "canceled";
      case "incomplete":
      case "incomplete_expired":
        return "inactive";
      case "past_due":
        return "past_due";
      case "trialing":
        return "active";
      case "unpaid":
        return "past_due";
      default:
        return "inactive";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      console.error("Invalid date format:", dateString, error);
      return dateString;
    }
  };

  return (
    <div className="space-y-6 p-4 animate-fade-in">
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
              ) : studySessions.length === 0 ? (
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
                      {studySessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {formatDate(session.date)}
                          </TableCell>
                          <TableCell>{session.subject_name || "—"}</TableCell>
                          <TableCell>{formatMinutesToHoursAndMinutes(session.study_time)}</TableCell>
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
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            {formatDate(question.created_at)}
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
                            {formatDate(item.created_at)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={formatSubscriptionStatus(item.status)} />
                          </TableCell>
                          <TableCell>
                            {item.current_period_start && item.current_period_end ? (
                              <>
                                {formatDate(item.current_period_start)} {" - "}
                                {formatDate(item.current_period_end)}
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
  );
}
