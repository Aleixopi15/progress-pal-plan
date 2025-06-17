
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Subject {
  id: string;
  name: string;
  description: string | null;
}

interface ScheduleEvent {
  id: string;
  subject_id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface ScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: ScheduleEvent | null;
  defaultSlot?: { day: number; hour: number } | null;
  onSave: () => void;
}

export function ScheduleEventDialog({
  open,
  onOpenChange,
  event,
  defaultSlot,
  onSave,
}: ScheduleEventDialogProps) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      return data as Subject[];
    },
  });

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setSubjectId(event.subject_id);
      setDayOfWeek(event.day_of_week);
      setStartTime(event.start_time);
      setEndTime(event.end_time);
    } else if (defaultSlot) {
      setTitle("");
      setSubjectId("");
      setDayOfWeek(defaultSlot.day);
      setStartTime(`${defaultSlot.hour.toString().padStart(2, '0')}:00`);
      setEndTime(`${(defaultSlot.hour + 1).toString().padStart(2, '0')}:00`);
    } else {
      setTitle("");
      setSubjectId("");
      setDayOfWeek(0);
      setStartTime("");
      setEndTime("");
    }
  }, [event, defaultSlot, open]);

  const handleSave = async () => {
    if (!title || !subjectId || !startTime || !endTime) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const eventData = {
        title,
        subject_id: subjectId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        user_id: user.id,
      };

      if (event) {
        const { error } = await supabase
          .from('schedule_events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;
        toast.success("Evento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('schedule_events')
          .insert([eventData]);

        if (error) throw error;
        toast.success("Evento criado com sucesso!");
      }

      onSave();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error("Erro ao salvar evento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;
      toast.success("Evento excluído com sucesso!");
      onSave();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("Erro ao excluir evento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {event ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Matemática - Álgebra"
            />
          </div>

          <div>
            <Label htmlFor="subject">Matéria *</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
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
            <Label htmlFor="day">Dia da Semana</Label>
            <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Hora de Início *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endTime">Hora de Fim *</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {event && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
