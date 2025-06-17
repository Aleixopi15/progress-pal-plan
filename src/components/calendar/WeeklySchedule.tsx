
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ScheduleEvent {
  id: string;
  subject_id: string;
  title: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject?: {
    name: string;
  };
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Generate a color based on subject name for consistency
const getSubjectColor = (subjectName: string) => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export function WeeklySchedule() {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['schedule-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schedule_events')
        .select(`
          *,
          subject:subjects(name)
        `)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data as ScheduleEvent[];
    },
  });

  const handleEventSave = () => {
    queryClient.invalidateQueries({ queryKey: ['schedule-events'] });
    setDialogOpen(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const handleSlotClick = (day: number, hour: number) => {
    setSelectedSlot({ day, hour });
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setDialogOpen(true);
  };

  const getEventsForSlot = (day: number, hour: number) => {
    return events.filter(event => {
      const startHour = parseInt(event.start_time.split(':')[0]);
      const endHour = parseInt(event.end_time.split(':')[0]);
      return event.day_of_week === day && hour >= startHour && hour < endHour;
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Carregando cronograma...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">
            Semana de {selectedWeek.toLocaleDateString('pt-BR')}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Evento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cronograma Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="text-sm font-medium text-center p-2">Hora</div>
                {DAYS.map((day, index) => (
                  <div key={day} className="text-sm font-medium text-center p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="space-y-1">
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-8 gap-1">
                    <div className="text-xs text-center p-2 border rounded">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {DAYS.map((_, dayIndex) => {
                      const slotEvents = getEventsForSlot(dayIndex, hour);
                      return (
                        <div
                          key={dayIndex}
                          className="min-h-[40px] border rounded cursor-pointer hover:bg-muted/50 p-1"
                          onClick={() => handleSlotClick(dayIndex, hour)}
                        >
                          {slotEvents.map(event => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded text-white cursor-pointer"
                              style={{ backgroundColor: getSubjectColor(event.subject?.name || 'Default') }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent}
        defaultSlot={selectedSlot}
        onSave={handleEventSave}
      />
    </div>
  );
}
