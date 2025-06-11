
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

export function AddStudyTimeDialog({ open, onOpenChange, onStudyTimeAdded }: AddStudyTimeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: "",
    topic_id: "",
    date: formatDate(new Date(), "yyyy-MM-dd"),
    registration_time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    study_time: "",
    lesson: "",
    subtopic: "",
    correct_exercises: "",
    incorrect_exercises: "",
    start_page: "",
    end_page: "",
    video_start_time: "",
    video_end_time: "",
    comment: "",
  });

  useEffect(() => {
    if (user && open) {
      fetchSubjects();
    }
  }, [user, open]);

  useEffect(() => {
    if (formData.subject_id) {
      fetchTopics(formData.subject_id);
    } else {
      setTopics([]);
      setFormData(prev => ({ ...prev, topic_id: "" }));
    }
  }, [formData.subject_id]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as matérias."
      });
    }
  };

  const fetchTopics = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from("topics")
        .select("id, name")
        .eq("subject_id", subjectId)
        .order("name");

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os tópicos."
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id || !formData.study_time) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Matéria e tempo de estudo são obrigatórios."
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: user?.id,
          subject_id: formData.subject_id,
          topic_id: formData.topic_id || null,
          date: formData.date,
          registration_time: formData.registration_time,
          study_time: parseInt(formData.study_time),
          lesson: formData.lesson || null,
          subtopic: formData.subtopic || null,
          correct_exercises: formData.correct_exercises ? parseInt(formData.correct_exercises) : null,
          incorrect_exercises: formData.incorrect_exercises ? parseInt(formData.incorrect_exercises) : null,
          start_page: formData.start_page ? parseInt(formData.start_page) : null,
          end_page: formData.end_page ? parseInt(formData.end_page) : null,
          video_start_time: formData.video_start_time || null,
          video_end_time: formData.video_end_time || null,
          comment: formData.comment || null,
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Tempo de estudo registrado com sucesso."
      });

      // Reset form
      setFormData({
        subject_id: "",
        topic_id: "",
        date: formatDate(new Date(), "yyyy-MM-dd"),
        registration_time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        study_time: "",
        lesson: "",
        subtopic: "",
        correct_exercises: "",
        incorrect_exercises: "",
        start_page: "",
        end_page: "",
        video_start_time: "",
        video_end_time: "",
        comment: "",
      });

      onOpenChange(false);
      
      // Chama a função de callback para atualizar a página
      if (onStudyTimeAdded) {
        onStudyTimeAdded();
      }
    } catch (error) {
      console.error("Error saving study session:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível registrar o tempo de estudo."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Tempo de Estudo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Matéria *</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}
              >
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

            <div>
              <Label htmlFor="topic">Tópico</Label>
              <Select
                value={formData.topic_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, topic_id: value }))}
                disabled={!formData.subject_id}
              >
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
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={formData.registration_time}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_time: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="study_time">Tempo de Estudo (min) *</Label>
              <Input
                id="study_time"
                type="number"
                min="1"
                value={formData.study_time}
                onChange={(e) => setFormData(prev => ({ ...prev, study_time: e.target.value }))}
                placeholder="Ex: 60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lesson">Aula/Conteúdo</Label>
              <Input
                id="lesson"
                value={formData.lesson}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value }))}
                placeholder="Ex: Equações do 2º grau"
              />
            </div>

            <div>
              <Label htmlFor="subtopic">Subtópico</Label>
              <Input
                id="subtopic"
                value={formData.subtopic}
                onChange={(e) => setFormData(prev => ({ ...prev, subtopic: e.target.value }))}
                placeholder="Ex: Fórmula de Bhaskara"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="correct">Exercícios Corretos</Label>
              <Input
                id="correct"
                type="number"
                min="0"
                value={formData.correct_exercises}
                onChange={(e) => setFormData(prev => ({ ...prev, correct_exercises: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="incorrect">Exercícios Incorretos</Label>
              <Input
                id="incorrect"
                type="number"
                min="0"
                value={formData.incorrect_exercises}
                onChange={(e) => setFormData(prev => ({ ...prev, incorrect_exercises: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_page">Página Inicial</Label>
              <Input
                id="start_page"
                type="number"
                min="1"
                value={formData.start_page}
                onChange={(e) => setFormData(prev => ({ ...prev, start_page: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="end_page">Página Final</Label>
              <Input
                id="end_page"
                type="number"
                min="1"
                value={formData.end_page}
                onChange={(e) => setFormData(prev => ({ ...prev, end_page: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="video_start">Tempo Inicial do Vídeo</Label>
              <Input
                id="video_start"
                value={formData.video_start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, video_start_time: e.target.value }))}
                placeholder="Ex: 10:30"
              />
            </div>

            <div>
              <Label htmlFor="video_end">Tempo Final do Vídeo</Label>
              <Input
                id="video_end"
                value={formData.video_end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, video_end_time: e.target.value }))}
                placeholder="Ex: 25:45"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Comentários</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Observações sobre a sessão de estudo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
