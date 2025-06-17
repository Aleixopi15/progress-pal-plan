
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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

export interface AddStudyTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStudyTimeAdded: () => void;
  defaultTime?: number;
}

export function AddStudyTimeDialog({ open, onOpenChange, onStudyTimeAdded, defaultTime = 0 }: AddStudyTimeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [formData, setFormData] = useState({
    subject_id: "",
    topic_id: "",
    study_time: defaultTime,
    lesson: "",
    subtopic: "",
    start_page: "",
    end_page: "",
    correct_exercises: "",
    incorrect_exercises: "",
    video_start_time: "",
    video_end_time: "",
    comment: ""
  });

  useEffect(() => {
    if (open) {
      fetchSubjects();
      setFormData(prev => ({ ...prev, study_time: defaultTime }));
    }
  }, [open, defaultTime]);

  useEffect(() => {
    if (formData.subject_id) {
      fetchTopics(formData.subject_id);
    } else {
      setTopics([]);
      setFormData(prev => ({ ...prev, topic_id: "" }));
    }
  }, [formData.subject_id]);

  const fetchSubjects = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar matérias",
        description: error.message
      });
    }
  };

  const fetchTopics = async (subjectId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('subject_id', subjectId)
        .order('name', { ascending: true });

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar tópicos",
        description: error.message
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.subject_id || !formData.study_time) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Selecione uma matéria e informe o tempo de estudo."
      });
      return;
    }

    try {
      setLoading(true);
      
      const sessionData = {
        user_id: user.id,
        subject_id: formData.subject_id,
        topic_id: formData.topic_id || null,
        study_time: formData.study_time,
        lesson: formData.lesson || null,
        subtopic: formData.subtopic || null,
        start_page: formData.start_page ? parseInt(formData.start_page) : null,
        end_page: formData.end_page ? parseInt(formData.end_page) : null,
        correct_exercises: formData.correct_exercises ? parseInt(formData.correct_exercises) : null,
        incorrect_exercises: formData.incorrect_exercises ? parseInt(formData.incorrect_exercises) : null,
        video_start_time: formData.video_start_time || null,
        video_end_time: formData.video_end_time || null,
        comment: formData.comment || null,
        date: new Date().toISOString().split('T')[0],
        registration_time: new Date().toTimeString().split(' ')[0].substring(0, 5)
      };

      const { error } = await supabase
        .from('study_sessions')
        .insert([sessionData]);

      if (error) throw error;

      toast({
        title: "Tempo de estudo registrado!",
        description: "Sua sessão de estudo foi salva com sucesso."
      });

      // Reset form
      setFormData({
        subject_id: "",
        topic_id: "",
        study_time: 0,
        lesson: "",
        subtopic: "",
        start_page: "",
        end_page: "",
        correct_exercises: "",
        incorrect_exercises: "",
        video_start_time: "",
        video_end_time: "",
        comment: ""
      });

      onStudyTimeAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar tempo de estudo",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Tempo de Estudo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Matéria *</Label>
              <Select 
                value={formData.subject_id} 
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a matéria" />
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
            
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico</Label>
              <Select 
                value={formData.topic_id} 
                onValueChange={(value) => setFormData({ ...formData, topic_id: value })}
                disabled={!formData.subject_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tópico" />
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="study_time">Tempo de Estudo (minutos) *</Label>
              <Input
                id="study_time"
                type="number"
                min="1"
                value={formData.study_time}
                onChange={(e) => setFormData({ ...formData, study_time: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 60"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lesson">Aula/Conteúdo</Label>
              <Input
                id="lesson"
                value={formData.lesson}
                onChange={(e) => setFormData({ ...formData, lesson: e.target.value })}
                placeholder="Ex: Funções Quadráticas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtopic">Subtópico</Label>
            <Input
              id="subtopic"
              value={formData.subtopic}
              onChange={(e) => setFormData({ ...formData, subtopic: e.target.value })}
              placeholder="Ex: Parábolas e gráficos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_page">Página Inicial</Label>
              <Input
                id="start_page"
                type="number"
                value={formData.start_page}
                onChange={(e) => setFormData({ ...formData, start_page: e.target.value })}
                placeholder="Ex: 45"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_page">Página Final</Label>
              <Input
                id="end_page"
                type="number"
                value={formData.end_page}
                onChange={(e) => setFormData({ ...formData, end_page: e.target.value })}
                placeholder="Ex: 52"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correct_exercises">Exercícios Corretos</Label>
              <Input
                id="correct_exercises"
                type="number"
                min="0"
                value={formData.correct_exercises}
                onChange={(e) => setFormData({ ...formData, correct_exercises: e.target.value })}
                placeholder="Ex: 8"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incorrect_exercises">Exercícios Incorretos</Label>
              <Input
                id="incorrect_exercises"
                type="number"
                min="0"
                value={formData.incorrect_exercises}
                onChange={(e) => setFormData({ ...formData, incorrect_exercises: e.target.value })}
                placeholder="Ex: 2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video_start_time">Tempo Inicial do Vídeo</Label>
              <Input
                id="video_start_time"
                value={formData.video_start_time}
                onChange={(e) => setFormData({ ...formData, video_start_time: e.target.value })}
                placeholder="Ex: 15:30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video_end_time">Tempo Final do Vídeo</Label>
              <Input
                id="video_end_time"
                value={formData.video_end_time}
                onChange={(e) => setFormData({ ...formData, video_end_time: e.target.value })}
                placeholder="Ex: 45:20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentários</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Observações sobre a sessão de estudo..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
