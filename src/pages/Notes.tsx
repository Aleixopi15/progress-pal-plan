
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash, Book, FileText, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { NoteDialog } from "@/components/subjects/NoteDialog";
import { QuestionDialog } from "@/components/subjects/QuestionDialog";
import { useAuth } from "@/lib/auth";

export interface Note {
  id: string;
  content: string;
  topic_id: string;
  user_id: string;
  created_at: string;
}

export interface Question {
  id: string;
  content: string;
  answer: string;
  is_correct: boolean;
  topic_id: string;
  user_id: string;
  created_at: string;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<{ id: string; name: string; subject_id: string } | null>(null);
  const [subject, setSubject] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [activeTab, setActiveTab] = useState("notes");
  
  const { subjectId, topicId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (subjectId && topicId) {
      fetchSubject(subjectId);
      fetchTopic(topicId);
      fetchNotes(topicId);
      fetchQuestions(topicId);
    }
  }, [subjectId, topicId, user]);

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
        description: error.message
      });
      navigate('/subjects');
    }
  }

  async function fetchTopic(id: string) {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('topics')
        .select('id, name, subject_id')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setTopic(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tópico",
        description: error.message
      });
      navigate('/subjects');
    }
  }

  async function fetchNotes(topicId: string) {
    try {
      setIsLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setNotes(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar anotações",
        description: error.message || "Ocorreu um erro ao carregar as anotações."
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchQuestions(topicId: string) {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setQuestions(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar questões",
        description: error.message || "Ocorreu um erro ao carregar as questões."
      });
    }
  }

  const handleAddNote = () => {
    setCurrentNote(null);
    setIsNoteDialogOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsNoteDialogOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== id));
      
      toast({
        title: "Anotação excluída",
        description: "A anotação foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir anotação",
        description: error.message || "Ocorreu um erro ao excluir a anotação."
      });
    }
  };

  const handleAddQuestion = () => {
    setCurrentQuestion(null);
    setIsQuestionDialogOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuestions(questions.filter(question => question.id !== id));
      
      toast({
        title: "Questão excluída",
        description: "A questão foi excluída com sucesso."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir questão",
        description: error.message || "Ocorreu um erro ao excluir a questão."
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        <PageTitle 
          title={topic?.name || "Anotações e Questões"} 
          subtitle={subject ? `Matéria: ${subject.name}` : ""}
        >
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/topics/${subjectId}`)}>
              Voltar
            </Button>
          </div>
        </PageTitle>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-[400px] mb-4">
            <TabsTrigger value="notes">Anotações</TabsTrigger>
            <TabsTrigger value="questions">Questões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="notes">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddNote}>
                <Plus className="mr-1" size={18} />
                Nova Anotação
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">Carregando...</div>
            ) : notes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma anotação encontrada</h3>
                    <p className="text-muted-foreground mb-4">Adicione anotações para estudar este tópico.</p>
                    <Button onClick={handleAddNote}>
                      <Plus className="mr-1" size={18} />
                      Nova Anotação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="w-full whitespace-pre-wrap">
                          {note.content}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="outline" size="icon" onClick={() => handleEditNote(note)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteNote(note.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-4">
                        Criado em: {new Date(note.created_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="questions">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddQuestion}>
                <Plus className="mr-1" size={18} />
                Nova Questão
              </Button>
            </div>
            
            {questions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma questão encontrada</h3>
                    <p className="text-muted-foreground mb-4">Adicione questões para testar seu conhecimento.</p>
                    <Button onClick={handleAddQuestion}>
                      <Plus className="mr-1" size={18} />
                      Nova Questão
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {questions.map((question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        Questão 
                        <span className={`ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          question.is_correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {question.is_correct ? <Check size={14} /> : <X size={14} />}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium mb-1">Pergunta:</div>
                          <div className="whitespace-pre-wrap">{question.content}</div>
                        </div>
                        <div>
                          <div className="font-medium mb-1">Resposta:</div>
                          <div className="whitespace-pre-wrap">{question.answer}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditQuestion(question)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {topicId && (
        <>
          <NoteDialog 
            open={isNoteDialogOpen}
            setOpen={setIsNoteDialogOpen}
            note={currentNote}
            topicId={topicId}
            onSuccess={() => fetchNotes(topicId)}
          />
          
          <QuestionDialog 
            open={isQuestionDialogOpen}
            setOpen={setIsQuestionDialogOpen}
            question={currentQuestion}
            topicId={topicId}
            onSuccess={() => fetchQuestions(topicId)}
          />
        </>
      )}
    </DashboardLayout>
  );
}
