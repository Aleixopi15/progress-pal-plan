
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

export interface Subject {
  id: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
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

      setSubjects(data || []);
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

  const handleEditSubject = (subject: Subject) => {
    setCurrentSubject(subject);
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
                        <TableHead className="hidden md:table-cell">Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
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
                        <span className="text-left font-medium">{subject.name}</span>
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
