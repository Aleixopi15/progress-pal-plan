
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash, FileText, Check, X } from "lucide-react";
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
import { TopicDialog } from "@/components/subjects/TopicDialog";
import { useAuth } from "@/lib/auth";

export interface Topic {
  id: string;
  name: string;
  description: string;
  subject_id: string;
  user_id: string;
  created_at: string;
}

export default function Topics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subject, setSubject] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const { subjectId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (subjectId) {
      fetchSubject(subjectId);
      fetchTopics(subjectId);
    }
  }, [subjectId, user]);

  async function fetchSubject(id: string) {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setSubject(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar matéria",
        description: error.message || "Ocorreu um erro ao carregar os detalhes da matéria."
      });
      navigate('/subjects');
    }
  }

  async function fetchTopics(subjectId: string) {
    try {
      setIsLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTopics(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tópicos",
        description: error.message || "Ocorreu um erro ao carregar os tópicos desta matéria."
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddTopic = () => {
    setCurrentTopic(null);
    setIsDialogOpen(true);
  };

  const handleEditTopic = (topic: Topic) => {
    setCurrentTopic(topic);
    setIsDialogOpen(true);
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTopics(topics.filter(topic => topic.id !== id));
      
      toast({
        title: "Tópico excluído",
        description: "O tópico foi excluído com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir tópico",
        description: error.message || "Ocorreu um erro ao excluir o tópico."
      });
    }
  };

  const handleOpenNotes = (topicId: string) => {
    if (subjectId) {
      navigate(`/notes/${subjectId}/${topicId}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <PageTitle 
          title={subject?.name || "Tópicos"} 
          subtitle="Gerencie os tópicos desta matéria"
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/subjects')}>
              Voltar
            </Button>
            <Button onClick={handleAddTopic}>
              <Plus className="mr-1" size={18} />
              Novo Tópico
            </Button>
          </div>
        </PageTitle>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">Carregando...</div>
            ) : topics.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum tópico encontrado</h3>
                <p className="text-muted-foreground mb-4">Adicione tópicos para organizar o conteúdo desta matéria.</p>
                <Button onClick={handleAddTopic}>
                  <Plus className="mr-1" size={18} />
                  Novo Tópico
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
                  {topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{topic.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleOpenNotes(topic.id)}>
                            <FileText size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleEditTopic(topic)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteTopic(topic.id)}>
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
      </div>

      {subjectId && (
        <TopicDialog 
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          topic={currentTopic}
          subjectId={subjectId}
          onSuccess={() => fetchTopics(subjectId)}
        />
      )}
    </DashboardLayout>
  );
}
