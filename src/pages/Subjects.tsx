
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash, Book, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { SubjectDialog } from "@/components/subjects/SubjectDialog";
import { useAuth } from "@/lib/auth";
import { SubjectQuestions } from "@/components/subjects/SubjectQuestions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

export interface Subject {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}

interface SubjectStats {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
  totalTopics: number;
  totalQuestions: number;
  correctQuestions: number;
  incorrectQuestions: number;
  progress: number;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<SubjectStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState("subjects");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSubjects = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get statistics for each subject
      const subjectsWithStats = await Promise.all((data || []).map(async (subject) => {
        // Get topics for this subject
        const { data: topicsData } = await supabase
          .from('topics')
          .select('id')
          .eq('subject_id', subject.id);

        const totalTopics = topicsData?.length || 0;
        let totalQuestions = 0;
        let correctQuestions = 0;

        // If there are topics, get questions for each topic
        if (totalTopics > 0) {
          const topicIds = topicsData.map(topic => topic.id);
          const { data: questionsData } = await supabase
            .from('questions')
            .select('*')
            .in('topic_id', topicIds);

          if (questionsData) {
            totalQuestions = questionsData.length;
            correctQuestions = questionsData.filter(q => q.is_correct).length;
          }
        }

        const progress = totalQuestions > 0 
          ? Math.round((correctQuestions / totalQuestions) * 100) 
          : 0;

        return {
          ...subject,
          totalTopics,
          totalQuestions,
          correctQuestions,
          incorrectQuestions: totalQuestions - correctQuestions,
          progress
        };
      }));

      setSubjects(subjectsWithStats);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar matérias",
        description: error.message || "Ocorreu um erro ao carregar suas matérias."
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAddSubject = () => {
    setCurrentSubject(null);
    setIsDialogOpen(true);
  };

  const handleEditSubject = (subject: SubjectStats) => {
    // Convert back to Subject type for the dialog
    const basicSubject: Subject = {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      user_id: subject.user_id,
      created_at: subject.created_at,
    };
    setCurrentSubject(basicSubject);
    setIsDialogOpen(true);
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubjects(subjects.filter(subject => subject.id !== id));
      
      toast({
        title: "Matéria excluída",
        description: "A matéria foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir matéria",
        description: error.message || "Ocorreu um erro ao excluir a matéria."
      });
    }
  };

  const handleOpenTopics = (subjectId: string) => {
    navigate(`/topics/${subjectId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <PageTitle 
          title="Matérias" 
          subtitle="Gerencie suas matérias de estudo"
        >
          <Button onClick={handleAddSubject}>
            <Plus className="mr-1" size={18} />
            Nova Matéria
          </Button>
        </PageTitle>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="subjects">Matérias</TabsTrigger>
            <TabsTrigger value="questions">Questões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : subjects.length === 0 ? (
                  <div className="text-center py-8">
                    <Book size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma matéria encontrada</h3>
                    <p className="text-muted-foreground mb-4">Comece adicionando sua primeira matéria de estudo.</p>
                    <Button onClick={handleAddSubject}>
                      <Plus className="mr-1" size={18} />
                      Nova Matéria
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden sm:table-cell">Estatísticas</TableHead>
                        <TableHead className="hidden md:table-cell">Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="font-medium">{subject.totalTopics}</span> tópicos
                                </div>
                                <div>
                                  <span className="text-green-600 font-medium">{subject.correctQuestions}</span> acertos
                                </div>
                                <div>
                                  <span className="text-red-600 font-medium">{subject.incorrectQuestions}</span> erros
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={subject.progress} className="h-2 flex-1" />
                                <span className="text-xs font-medium">{subject.progress}%</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{subject.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" onClick={() => handleOpenTopics(subject.id)}>
                                <Book size={16} />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleEditSubject(subject)}>
                                <Edit size={16} />
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleDeleteSubject(subject.id)}>
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            {subjects.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Book size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma matéria encontrada</h3>
                    <p className="text-muted-foreground mb-4">Adicione matérias para gerenciar questões.</p>
                    <Button onClick={handleAddSubject}>
                      <Plus className="mr-1" size={18} />
                      Nova Matéria
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {subjects.map((subject) => (
                    <AccordionItem key={subject.id} value={subject.id}>
                      <AccordionTrigger>
                        <div className="flex flex-1 items-center justify-between pr-4">
                          <span className="text-left font-medium">{subject.name}</span>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="hidden sm:inline">
                              <span className="text-green-600 font-medium">{subject.correctQuestions}</span> acertos,
                              <span className="text-red-600 font-medium ml-1">{subject.incorrectQuestions}</span> erros
                            </span>
                            <span className="hidden sm:inline">{subject.progress}% concluído</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <SubjectQuestions subjectId={subject.id} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <SubjectDialog 
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        subject={currentSubject}
        onSuccess={fetchSubjects}
      />
    </DashboardLayout>
  );
}
