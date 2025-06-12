
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

interface ScheduleEvent {
  id: string;
  user_id: string;
  subject_id: string;
  subject_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: string;
  name: string;
}

const DAYS_OF_WEEK = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
];

interface ScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: ScheduleEvent | null;
  selectedDay?: number | null;
  selectedTime?: string | null;
  onSuccess: () => void;
}

export function ScheduleEventDialog({ 
  open, 
  onOpenChange, 
  event, 
  selectedDay, 
  selectedTime, 
  onSuccess 
}: ScheduleEventDialogProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    subject_id: "",
    day_of_week: selectedDay || 0,
    start_time: selectedTime || "09:00",
    end_time: "10:00",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSubjects();
      if (event) {
        setFormData({
          title: event.title,
          subject_id: event.subject_id,
          day_of_week: event.day_of_week,
          start_time: event.start_time,
          end_time: event.end_time,
          description: event.description || ""
        });
      } else {
        setFormData({
          title: "",
          subject_id: "",
          day_of_week: selectedDay !== null ? selectedDay : 0,
          start_time: selectedTime || "09:00",
          end_time: selectedTime ? getNextHour(selectedTime) : "10:00",
          description: ""
        });
      }
    }
  }, [open, event, selectedDay, selectedTime]);

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

  const getNextHour = (time: string) => {
    const [hours] = time.split(':');
    const nextHour = (parseInt(hours) + 1) % 24;
    return `${nextHour.toString().padStart(2, '0')}:00`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.start_time >= formData.end_time) {
      toast({
        variant: "destructive",
        title: "Erro de validação",
        description: "O horário de término deve ser posterior ao horário de início."
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const eventData = {
        user_id: user.id,
        title: formData.title,
        subject_id: formData.subject_id,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        description: formData.description || null,
        updated_at: new Date().toISOString()
      };

      if (event) {
        const { error } = await supabase
          .from('schedule_events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;

        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('schedule_events')
          .insert([{
            ...eventData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;

        toast({
          title: "Evento criado",
          description: "O evento foi adicionado ao cronograma."
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar evento",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {event ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Revisão de Matemática"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Dia da Semana</Label>
            <Select 
              value={formData.day_of_week.toString()} 
              onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Horário de Início</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_time">Horário de Término</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes sobre o que será estudado..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : event ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
