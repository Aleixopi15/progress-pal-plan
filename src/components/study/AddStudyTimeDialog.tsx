
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface AddStudyTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Subject {
  id: string;
  name: string;
}

export function AddStudyTimeDialog({ open, onOpenChange }: AddStudyTimeDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [subtopic, setSubtopic] = useState<string>("");
  const [studyTime, setStudyTime] = useState<string>("");
  const [lesson, setLesson] = useState<string>("");
  const [correctExercises, setCorrectExercises] = useState<string>("");
  const [incorrectExercises, setIncorrectExercises] = useState<string>("");
  const [startPage, setStartPage] = useState<string>("");
  const [endPage, setEndPage] = useState<string>("");
  const [videoStartTime, setVideoStartTime] = useState<string>("");
  const [videoEndTime, setVideoEndTime] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const currentTime = format(new Date(), "HH:mm:ss");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchSubjects();
    }
  }, [open, user]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    } else {
      setTopics([]);
      setSelectedTopic("");
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar matérias",
        description: error.message || "Ocorreu um erro ao carregar as matérias."
      });
    }
  };

  const fetchTopics = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('id, name')
        .eq('subject_id', subjectId)
        .order('name');

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      console.error('Error fetching topics:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar tópicos",
        description: error.message || "Ocorreu um erro ao carregar os tópicos."
      });
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setSelectedSubject("");
    setSelectedTopic("");
    setSubtopic("");
    setStudyTime("");
    setLesson("");
    setCorrectExercises("");
    setIncorrectExercises("");
    setStartPage("");
    setEndPage("");
    setVideoStartTime("");
    setVideoEndTime("");
    setComment("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para registrar tempo de estudo."
      });
      return;
    }

    if (!date || !selectedSubject || !studyTime) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Data, matéria e tempo de estudo são campos obrigatórios."
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create the study time entry
      const { error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: selectedSubject,
          topic_id: selectedTopic || null,
          date: date.toISOString().split('T')[0],
          registration_time: currentTime,
          subtopic: subtopic || null,
          study_time: studyTime,
          lesson: lesson || null,
          correct_exercises: correctExercises ? parseInt(correctExercises) : null,
          incorrect_exercises: incorrectExercises ? parseInt(incorrectExercises) : null,
          start_page: startPage ? parseInt(startPage) : null,
          end_page: endPage ? parseInt(endPage) : null,
          video_start_time: videoStartTime || null,
          video_end_time: videoEndTime || null,
          comment: comment || null
        });

      if (error) throw error;
      
      toast({
        title: "Tempo de estudo registrado",
        description: "Seu tempo de estudo foi registrado com sucesso!"
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar tempo de estudo",
        description: error.message || "Ocorreu um erro ao registrar o tempo de estudo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Tempo de Estudo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Horário do Registro */}
            <div className="space-y-2">
              <Label>Horário do Registro</Label>
              <div className="flex items-center rounded-md border border-input bg-background px-3 h-10">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{currentTime}</span>
              </div>
            </div>
            
            {/* Disciplina */}
            <div className="space-y-2">
              <Label htmlFor="subject">Disciplina <span className="text-red-500">*</span></Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
            
            {/* Tópico */}
            <div className="space-y-2">
              <Label htmlFor="topic">Categoria</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedSubject || topics.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tópico" />
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
            
            {/* Subtópico */}
            <div className="space-y-2">
              <Label htmlFor="subtopic">Subtópico</Label>
              <Input
                id="subtopic"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                placeholder="Subtópico estudado"
              />
            </div>
            
            {/* Tempo de Estudo */}
            <div className="space-y-2">
              <Label htmlFor="studyTime">Tempo de Estudo (min) <span className="text-red-500">*</span></Label>
              <Input
                id="studyTime"
                type="number"
                min="1"
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                placeholder="Ex: 60"
                required
              />
            </div>
            
            {/* Aula / Capítulo */}
            <div className="space-y-2">
              <Label htmlFor="lesson">Aula / Capítulo</Label>
              <Input
                id="lesson"
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="Ex: Aula 5 / Capítulo 3"
              />
            </div>
            
            {/* Exercícios */}
            <div className="space-y-2">
              <Label>Exercícios</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={correctExercises}
                    onChange={(e) => setCorrectExercises(e.target.value)}
                    placeholder="C (Certos)"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={incorrectExercises}
                    onChange={(e) => setIncorrectExercises(e.target.value)}
                    placeholder="E (Errados)"
                  />
                </div>
              </div>
            </div>
            
            {/* Páginas */}
            <div className="space-y-2">
              <Label>Páginas</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    placeholder="Inicial"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    placeholder="Final"
                  />
                </div>
              </div>
            </div>
            
            {/* Videoaulas */}
            <div className="space-y-2">
              <Label>Videoaulas</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="text"
                    value={videoStartTime}
                    onChange={(e) => setVideoStartTime(e.target.value)}
                    placeholder="Tempo inicial (hh:mm:ss)"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={videoEndTime}
                    onChange={(e) => setVideoEndTime(e.target.value)}
                    placeholder="Tempo final (hh:mm:ss)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Comentário */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentário</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Observações adicionais"
              rows={3}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
