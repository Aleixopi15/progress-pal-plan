import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarCheck, Clock, Plus, Trash2 } from "lucide-react";

interface StudySession {
  id: string;
  title: string;
  description?: string;
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
}

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: "1",
      title: "Revisão de Matemática",
      description: "Revisão de álgebra e geometria analítica",
      subject: "Matemática",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:30",
    },
    {
      id: "2",
      title: "Física - Mecânica",
      subject: "Física",
      date: new Date(),
      startTime: "14:00",
      endTime: "15:30",
    },
    {
      id: "3",
      title: "Literatura Brasileira",
      subject: "Português",
      date: addDays(new Date(), 1),
      startTime: "10:00",
      endTime: "11:30",
    },
    {
      id: "4",
      title: "História do Brasil",
      subject: "História",
      date: addDays(new Date(), 2),
      startTime: "16:00",
      endTime: "17:30",
    },
  ]);

  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    title: "",
    subject: "",
    date: new Date(),
    startTime: "",
    endTime: "",
  });

  const handleAddSession = () => {
    if (!newSession.title || !newSession.subject || !newSession.startTime || !newSession.endTime) {
      return;
    }

    const session: StudySession = {
      id: Date.now().toString(),
      title: newSession.title,
      description: newSession.description,
      subject: newSession.subject,
      date: newSession.date || new Date(),
      startTime: newSession.startTime,
      endTime: newSession.endTime,
    };

    setSessions([...sessions, session]);
    setNewSession({
      title: "",
      subject: "",
      date: new Date(),
      startTime: "",
      endTime: "",
    });
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((session) => session.id !== id));
  };

  // Filtrar as sessões pela data selecionada
  const filteredSessions = sessions.filter(
    (session) => 
      date && 
      session.date.getDate() === date.getDate() &&
      session.date.getMonth() === date.getMonth() &&
      session.date.getFullYear() === date.getFullYear()
  );

  // Dias com sessões agendadas
  const daysWithSessions = sessions.map(session => session.date);

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Cronograma" 
        subtitle="Organize suas sessões de estudo"
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button data-trigger="dialog">
              <Plus className="mr-2 h-4 w-4" /> 
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Nova Sessão</DialogTitle>
              <DialogDescription>
                Crie uma nova sessão de estudo no seu cronograma.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="col-span-1">
                  Título
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="Ex: Revisão de Matemática"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="col-span-1">
                  Disciplina
                </Label>
                <Select 
                  onValueChange={(value) => setNewSession({ ...newSession, subject: value })}
                  value={newSession.subject}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a matéria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matemática">Matemática</SelectItem>
                    <SelectItem value="Física">Física</SelectItem>
                    <SelectItem value="Química">Química</SelectItem>
                    <SelectItem value="Biologia">Biologia</SelectItem>
                    <SelectItem value="História">História</SelectItem>
                    <SelectItem value="Geografia">Geografia</SelectItem>
                    <SelectItem value="Português">Português</SelectItem>
                    <SelectItem value="Inglês">Inglês</SelectItem>
                    <SelectItem value="Filosofia">Filosofia</SelectItem>
                    <SelectItem value="Sociologia">Sociologia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="col-span-1">
                  Data
                </Label>
                <div className="col-span-3">
                  <CalendarComponent
                    mode="single"
                    selected={newSession.date}
                    onSelect={(date) => setNewSession({ ...newSession, date })}
                    className="rounded-md border p-3 pointer-events-auto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start-time" className="col-span-1">
                  Início
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  className="col-span-3"
                  value={newSession.startTime}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-time" className="col-span-1">
                  Término
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  className="col-span-3"
                  value={newSession.endTime}
                  onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="col-span-1">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Detalhes sobre o que será estudado..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddSession}>Adicionar Sessão</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      <Tabs defaultValue="calendar" className="mt-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border pointer-events-auto"
                  modifiers={{
                    booked: daysWithSessions,
                  }}
                  modifiersStyles={{
                    booked: { fontWeight: 'bold', color: 'hsl(var(--primary))' }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Sessões para {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Hoje"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSessions.length > 0 ? (
                  <div className="space-y-4">
                    {filteredSessions.map((session) => (
                      <div key={session.id} className="flex items-start gap-4 border rounded-lg p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CalendarCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{session.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.subject}
                          </p>
                          {session.description && (
                            <p className="text-sm">{session.description}</p>
                          )}
                          <div className="flex items-center pt-2 gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">Nenhuma sessão agendada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Não há sessões de estudo agendadas para esta data.
                    </p>
                    <Button className="mt-4" onClick={() => document.querySelector('[data-trigger="dialog"]')?.dispatchEvent(new Event('click'))}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Sessão
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="list" className="animate-fade-in">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Todas as Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.length > 0 ? (
                  sessions
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((session) => (
                      <div key={session.id} className="flex items-start gap-4 border rounded-lg p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CalendarCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{session.title}</h3>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.subject}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:gap-4 pt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <CalendarCheck className="h-4 w-4" />
                              <span>{format(session.date, "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{session.startTime} - {session.endTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarCheck className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">Nenhuma sessão agendada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Crie sua primeira sessão de estudo!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
