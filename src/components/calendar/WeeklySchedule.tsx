
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ScheduleEventDialog } from "./ScheduleEventDialog";

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

const DAYS_OF_WEEK = [
  { label: "Dom", full: "Domingo" },
  { label: "Seg", full: "Segunda" },
  { label: "Ter", full: "Terça" },
  { label: "Qua", full: "Quarta" },
  { label: "Qui", full: "Quinta" },
  { label: "Sex", full: "Sexta" },
  { label: "Sáb", full: "Sábado" },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export function WeeklySchedule() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schedule_events')
        .select(`
          *,
          subjects!inner(name)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const eventsWithSubjectName = (data || []).map(event => ({
        ...event,
        subject_name: event.subjects?.name || 'Matéria não encontrada'
      }));

      setEvents(eventsWithSubjectName);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar cronograma",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = (dayOfWeek: number, time?: string) => {
    setSelectedEvent(null);
    setSelectedDay(dayOfWeek);
    setSelectedTime(time || null);
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setSelectedDay(null);
    setSelectedTime(null);
    setIsDialogOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('schedule_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(e => e.id !== eventId));
      
      toast({
        title: "Evento excluído",
        description: "O evento foi removido do cronograma."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir evento",
        description: error.message
      });
    }
  };

  const getEventsForDay = (dayOfWeek: number) => {
    return events
      .filter(event => event.day_of_week === dayOfWeek)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getEventAtTime = (dayOfWeek: number, time: string) => {
    return events.find(event => 
      event.day_of_week === dayOfWeek && 
      event.start_time <= time && 
      event.end_time > time
    );
  };

  const previousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const nextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-muted-foreground">Carregando cronograma...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação da semana */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(weekStart, "dd/MM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd/MM/yyyy", { locale: ptBR })}
          </h2>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => handleAddEvent(0)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-8 divide-x border-b">
              <div className="p-4 bg-muted/50">
                <div className="text-sm font-medium">Horário</div>
              </div>
              {DAYS_OF_WEEK.map((day, index) => (
                <div key={index} className="p-4 bg-muted/50 text-center">
                  <div className="text-sm font-medium">{day.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(weekDays[index], "dd/MM")}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {TIME_SLOTS.slice(6, 24).map((time) => (
                <div key={time} className="grid grid-cols-8 divide-x border-b min-h-[60px]">
                  <div className="p-2 text-sm text-muted-foreground bg-muted/20">
                    {time}
                  </div>
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const event = getEventAtTime(dayIndex, time);
                    return (
                      <div 
                        key={dayIndex} 
                        className="p-1 hover:bg-muted/50 cursor-pointer relative"
                        onClick={() => !event && handleAddEvent(dayIndex, time)}
                      >
                        {event && (
                          <div className="bg-primary/10 border border-primary/20 rounded p-2 text-xs h-full">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-muted-foreground truncate">{event.subject_name}</div>
                            <div className="flex gap-1 mt-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-5 w-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="flex overflow-x-auto gap-4 pb-4">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <Card key={dayIndex} className="flex-shrink-0 w-72">
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <div className="text-lg">{day.full}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {format(weekDays[dayIndex], "dd/MM")}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddEvent(dayIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getEventsForDay(dayIndex).map((event) => (
                    <div key={event.id} className="bg-primary/10 border border-primary/20 rounded p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.title}</div>
                          <div className="text-xs text-muted-foreground">{event.subject_name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {event.start_time} - {event.end_time}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {getEventsForDay(dayIndex).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Nenhum evento agendado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ScheduleEventDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        event={selectedEvent}
        selectedDay={selectedDay}
        selectedTime={selectedTime}
        onSuccess={() => {
          fetchEvents();
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
}
