
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface Subject {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
}

interface AddStudyTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudyTimeAdded?: () => void;
  defaultTime?: number;
}

export function AddStudyTimeDialog({ open, onOpenChange, onStudyTimeAdded, defaultTime }: AddStudyTimeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [studyTime, setStudyTime] = useState("");
  const [correctExercises, setCorrectExercises] = useState("");
  const [incorrectExercises, setIncorrectExercises] = useState("");
  const [lesson, setLesson] = useState("");
  const [subtopic, setSubtopic] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open && user) {
      fetchSubjects();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
      setSelectedTopic("");
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (defaultTime && defaultTime > 0) {
      setStudyTime(defaultTime.toString());
    }
  }, [defaultTime]);

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');
      
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchTopics = async (subjectId: string) => {
    try {
      const { data } = await supabase
        .from('topics')
        .select('id, name')
        .eq('subject_id', subjectId)
        .eq('user_id', user?.id)
        .order('name');
      
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSubject || !studyTime) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha pelo menos a matéria e o tempo de estudo"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Garantir que a data seja salva corretamente no timezone local
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateString = localDate.toISOString().split('T')[0];
      
      // Obter horário atual formatado corretamente
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS format

      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user?.id,
          subject_id: selectedSubject,
          topic_id: selectedTopic || null,
          date: dateString,
          registration_time: timeString,
          study_time: parseInt(studyTime),
          correct_exercises: correctExercises ? parseInt(correctExercises) : null,
          incorrect_exercises: incorrectExercises ? parseInt(incorrectExercises) : null,
          lesson: lesson || null,
          subtopic: subtopic || null,
          comment: comment || null
        });

      if (error) throw error;

      // Registrar questões individuais se especificadas
      if ((correctExercises && parseInt(correctExercises) > 0) || (incorrectExercises && parseInt(incorrectExercises) > 0)) {
        const questions = [];
        
        // Adicionar questões corretas
        if (correctExercises && parseInt(correctExercises) > 0) {
          for (let i = 0; i < parseInt(correctExercises); i++) {
            questions.push({
              user_id: user?.id,
              topic_id: selectedTopic || null,
              content: `Questão ${i + 1} - ${lesson || subtopic || 'Estudo'}`,
              answer: 'Correta',
              is_correct: true
            });
          }
        }
        
        // Adicionar questões incorretas
        if (incorrectExercises && parseInt(incorrectExercises) > 0) {
          for (let i = 0; i < parseInt(incorrectExercises); i++) {
            questions.push({
              user_id: user?.id,
              topic_id: selectedTopic || null,
              content: `Questão ${i + 1} - ${lesson || subtopic || 'Estudo'}`,
              answer: 'Incorreta',
              is_correct: false
            });
          }
        }

        if (questions.length > 0) {
          const { error: questionsError } = await supabase
            .from('questions')
            .insert(questions);

          if (questionsError) {
            console.error("Error inserting questions:", questionsError);
          }
        }
      }

      toast({
        title: "Sucesso!",
        description: "Tempo de estudo registrado com sucesso."
      });

      onStudyTimeAdded?.();
      onOpenChange(false);
      
      // Reset form
      setSelectedSubject("");
      setSelectedTopic("");
      setDate(new Date());
      setStudyTime("");
      setCorrectExercises("");
      setIncorrectExercises("");
      setLesson("");
      setSubtopic("");
      setComment("");
    } catch (error) {
      console.error("Error adding study time:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao registrar tempo de estudo"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Tempo de Estudo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Matéria *</Label>
            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma matéria" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {topics.length > 0 && (
            <div className="space-y-2">
              <Label>Tópico</Label>
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tópico (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="studyTime">Tempo de Estudo (minutos) *</Label>
            <Input
              id="studyTime"
              type="number"
              min="1"
              value={studyTime}
              onChange={(e) => setStudyTime(e.target.value)}
              placeholder="60"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correct">Exercícios Corretos</Label>
              <Input
                id="correct"
                type="number"
                min="0"
                value={correctExercises}
                onChange={(e) => setCorrectExercises(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incorrect">Exercícios Incorretos</Label>
              <Input
                id="incorrect"
                type="number"
                min="0"
                value={incorrectExercises}
                onChange={(e) => setIncorrectExercises(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson">Aula/Capítulo</Label>
            <Input
              id="lesson"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="Ex: Capítulo 5 - Funções"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtopic">Subtópico</Label>
            <Input
              id="subtopic"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="Ex: Função quadrática"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Observações</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentários sobre a sessão de estudo"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
