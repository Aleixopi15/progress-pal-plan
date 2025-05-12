
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface SubjectProgressProps {
  subjects?: {
    id: string;
    name: string;
    progress: number;
    color?: string;
    totalTopics?: number;
    totalQuestions?: number;
    correctQuestions?: number;
  }[];
}

export function SubjectProgress({ subjects: propSubjects }: SubjectProgressProps) {
  const [subjects, setSubjects] = useState<SubjectProgressProps["subjects"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (propSubjects) {
      setSubjects(propSubjects);
      setIsLoading(false);
      return;
    }

    if (user) {
      fetchSubjectsWithProgress();
    }
  }, [user, propSubjects]);

  async function fetchSubjectsWithProgress() {
    try {
      setIsLoading(true);
      
      // Busca as matérias do usuário
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (subjectsError) {
        throw subjectsError;
      }
      
      if (subjectsData) {
        // Para cada matéria, busca os tópicos e questões relacionados
        const subjectsWithProgress = await Promise.all(
          subjectsData.map(async (subject) => {
            // Busca os tópicos da matéria
            const { data: topicsData } = await supabase
              .from("topics")
              .select("id")
              .eq("subject_id", subject.id);
            
            const totalTopics = topicsData?.length || 0;
            let totalQuestions = 0;
            let correctQuestions = 0;
            
            // Para cada tópico, busca suas questões
            if (topicsData && topicsData.length > 0) {
              const topicIds = topicsData.map(topic => topic.id);
              
              const { data: questionsData } = await supabase
                .from("questions")
                .select("*")
                .in("topic_id", topicIds);
              
              totalQuestions = questionsData?.length || 0;
              correctQuestions = questionsData?.filter(q => q.is_correct)?.length || 0;
            }
            
            // Calcula o progresso
            const progress = totalQuestions === 0 ? 0 : Math.round((correctQuestions / totalQuestions) * 100);
            
            return {
              id: subject.id,
              name: subject.name,
              totalTopics,
              totalQuestions,
              correctQuestions,
              progress
            };
          })
        );
        
        setSubjects(subjectsWithProgress);
      }
    } catch (error) {
      console.error("Erro ao buscar progresso das matérias:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso das Matérias</CardTitle>
          <CardDescription>Seu desempenho em cada matéria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">Carregando progresso...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso das Matérias</CardTitle>
        <CardDescription>Seu desempenho em cada matéria</CardDescription>
      </CardHeader>
      <CardContent>
        {subjects && subjects.length === 0 ? (
          <div className="text-center py-4">
            <p>Você ainda não tem matérias cadastradas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subjects && subjects.map((subject) => (
              <div key={subject.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subject.totalTopics} tópicos • {subject.correctQuestions} de {subject.totalQuestions} questões corretas
                    </p>
                  </div>
                  <span className="text-sm font-medium">{subject.progress}%</span>
                </div>
                <Progress value={subject.progress} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
