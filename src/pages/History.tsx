
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, BookOpen } from "lucide-react";
import { formatDuration } from "@/lib/formatters";

interface StudySession {
  id: string;
  subject_id: string;
  subject_name: string;
  topic_id: string | null;
  topic_name: string | null;
  date: string;
  registration_time: string;
  subtopic: string | null;
  study_time: number;
  lesson: string | null;
  correct_exercises: number | null;
  incorrect_exercises: number | null;
  start_page: number | null;
  end_page: number | null;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
}

export default function History() {
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch subjects and study sessions
  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchStudySessions();
    }
  }, [user]);

  // Filter study sessions when subject is selected
  useEffect(() => {
    if (user) {
      fetchStudySessions();
    }
  }, [selectedSubject]);

  async function fetchSubjects() {
    try {
      const { data: subjectsData, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      setSubjects(subjectsData || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  }

  async function fetchStudySessions() {
    try {
      setIsLoading(true);

      // Start building the query
      let query = supabase
        .from("study_sessions")
        .select(`
          *,
          subjects:subject_id (name),
          topics:topic_id (name)
        `)
        .eq("user_id", user?.id)
        .order("date", { ascending: false })
        .order("registration_time", { ascending: false });

      // Apply subject filter if selected
      if (selectedSubject) {
        query = query.eq("subject_id", selectedSubject);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include subject and topic names
      const formattedSessions = data?.map(session => ({
        ...session,
        subject_name: session.subjects?.name || "Desconhecida",
        topic_name: session.topics?.name || null
      })) || [];

      setStudySessions(formattedSessions);
    } catch (error) {
      console.error("Error fetching study sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(dateString: string) {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  }

  function navigateToSubject(subjectId: string) {
    navigate(`/topics/${subjectId}`);
  }

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Histórico de Estudos" 
        subtitle="Histórico completo de suas sessões de estudo"
      />

      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Matéria</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as matérias" />
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
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Registro de Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="calendar">Calendário</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {isLoading ? (
                  <div className="flex justify-center py-8">Carregando atividades...</div>
                ) : studySessions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                    <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade encontrada</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Registre seu tempo de estudo para começar a acompanhar suas atividades.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Matéria</TableHead>
                        <TableHead>Tópico</TableHead>
                        <TableHead>Tempo</TableHead>
                        <TableHead>Exercícios</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studySessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(session.date)}</span>
                              <span className="text-xs text-muted-foreground">{session.registration_time}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{session.subject_name}</div>
                          </TableCell>
                          <TableCell>
                            {session.topic_name || (session.subtopic && `Subtópico: ${session.subtopic}`) || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(session.study_time * 60)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(session.correct_exercises !== null || session.incorrect_exercises !== null) ? (
                              <span>
                                {session.correct_exercises || 0} C / {session.incorrect_exercises || 0} E
                              </span>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigateToSubject(session.subject_id)}
                            >
                              Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="flex justify-center items-center py-12 flex-col gap-4">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Visualização de calendário será implementada em breve.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
