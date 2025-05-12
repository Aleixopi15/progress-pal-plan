
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Plus, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { QuestionCreateDialog } from "./QuestionCreateDialog";

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface QuestionStats {
  topicId: string;
  topicName: string;
  totalQuestions: number;
  correctQuestions: number;
  incorrectQuestions: number;
  percentage: number;
}

interface SubjectQuestionsProps {
  subjectId: string;
}

export function SubjectQuestions({ subjectId }: SubjectQuestionsProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (subjectId && user) {
      fetchTopics();
    }
  }, [subjectId, user]);

  useEffect(() => {
    if (topics.length > 0) {
      fetchQuestionStats();
    }
  }, [topics]);

  async function fetchTopics() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('topics')
        .select('id, name, description')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTopics(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar tópicos:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar tópicos",
        description: error.message || "Ocorreu um erro ao carregar os tópicos."
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestionStats() {
    try {
      const stats = await Promise.all(topics.map(async (topic) => {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('topic_id', topic.id);

        if (error) throw error;

        const questions = data || [];
        const total = questions.length;
        const correct = questions.filter(q => q.is_correct).length;
        const incorrect = total - correct;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

        return {
          topicId: topic.id,
          topicName: topic.name,
          totalQuestions: total,
          correctQuestions: correct,
          incorrectQuestions: incorrect,
          percentage
        };
      }));

      setQuestionStats(stats);
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas de questões:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar estatísticas",
        description: error.message || "Ocorreu um erro ao carregar as estatísticas das questões."
      });
    }
  }

  const handleAddQuestion = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedTopic(null);
    fetchQuestionStats();
  };

  const handleViewTopicDetails = (topicId: string) => {
    navigate(`/notes/${subjectId}/${topicId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Questões por Tópico</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Carregando tópicos...</p>
        </div>
      ) : topics.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhum tópico encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione tópicos para começar a criar questões.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {questionStats.map((stat) => (
            <Card key={stat.topicId}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium">{stat.topicName}</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewTopicDetails(stat.topicId)}
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddQuestion(topics.find(t => t.id === stat.topicId)!)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Questão
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 justify-between text-sm">
                    <div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                        <span>Acertos: {stat.correctQuestions}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                        <span>Erros: {stat.incorrectQuestions}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span>Total: {stat.totalQuestions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Aproveitamento</span>
                      <span>{stat.percentage}%</span>
                    </div>
                    <Progress value={stat.percentage} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTopic && (
        <QuestionCreateDialog
          open={isDialogOpen}
          setOpen={handleCloseDialog}
          topicId={selectedTopic.id}
          topicName={selectedTopic.name}
          onSuccess={handleCloseDialog}
        />
      )}
    </div>
  );
}
