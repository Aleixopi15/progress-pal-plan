
import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, CheckCircle, Clock, AlertTriangle, Calendar as CalendarIcon, Settings, Trash2 } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: "subject" | "time" | "task";
  target: number;
  current: number;
  unit: string;
  deadline: Date | null;
  subject?: string;
  priority: "high" | "medium" | "low";
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Completar módulo de matemática",
      description: "Estudar álgebra, geometria e trigonometria",
      type: "subject",
      target: 100,
      current: 65,
      unit: "%",
      deadline: new Date(2025, 5, 15),
      subject: "Matemática",
      priority: "high",
    },
    {
      id: "2",
      title: "Resolver exercícios de física",
      type: "task",
      target: 50,
      current: 32,
      unit: "questões",
      deadline: new Date(2025, 5, 20),
      subject: "Física",
      priority: "medium",
    },
    {
      id: "3",
      title: "Meta semanal de estudo",
      type: "time",
      target: 30,
      current: 23,
      unit: "horas",
      deadline: new Date(2025, 5, 10),
      priority: "high",
    },
    {
      id: "4",
      title: "Leitura de literatura",
      type: "task",
      target: 5,
      current: 3,
      unit: "livros",
      deadline: new Date(2025, 6, 30),
      subject: "Português",
      priority: "low",
    },
  ]);

  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    type: "subject",
    target: 0,
    current: 0,
    unit: "",
    deadline: new Date(),
    priority: "medium",
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.type || !newGoal.target || newGoal.target <= 0) {
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      type: newGoal.type || "subject",
      target: newGoal.target,
      current: newGoal.current || 0,
      unit: newGoal.unit || "%",
      deadline: newGoal.deadline || null,
      subject: newGoal.subject,
      priority: newGoal.priority || "medium",
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: "",
      type: "subject",
      target: 0,
      current: 0,
      unit: "",
      deadline: new Date(),
      priority: "medium",
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  const handleUpdateProgress = (id: string, value: number) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, current: Math.min(value, goal.target) } : goal
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-primary";
      case "low":
        return "text-secondary";
      default:
        return "text-primary";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "subject":
        return <Target className="h-5 w-5" />;
      case "time":
        return <Clock className="h-5 w-5" />;
      case "task":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  // Filtrar metas por tipo
  const subjectGoals = goals.filter((goal) => goal.type === "subject");
  const timeGoals = goals.filter((goal) => goal.type === "time");
  const taskGoals = goals.filter((goal) => goal.type === "task");

  // Calcular prazos
  const today = new Date();
  const upcomingDeadlines = goals
    .filter((goal) => goal.deadline && goal.deadline > today && goal.current < goal.target)
    .sort((a, b) => {
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      return 0;
    })
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Metas" 
        subtitle="Configure suas metas de estudo"
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
              <DialogDescription>
                Defina uma nova meta de estudo para acompanhar seu progresso.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goal-title" className="col-span-1">
                  Título
                </Label>
                <Input
                  id="goal-title"
                  className="col-span-3"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Completar módulo de matemática"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goal-type" className="col-span-1">
                  Tipo
                </Label>
                <Select 
                  onValueChange={(value) => setNewGoal({ 
                    ...newGoal, 
                    type: value as "subject" | "time" | "task",
                    unit: value === "time" ? "horas" : value === "task" ? "questões" : "%"
                  })}
                  value={newGoal.type}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subject">Progresso em Matéria</SelectItem>
                    <SelectItem value="time">Tempo de Estudo</SelectItem>
                    <SelectItem value="task">Conclusão de Tarefas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newGoal.type === "subject" && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="goal-subject" className="col-span-1">
                    Matéria
                  </Label>
                  <Select 
                    onValueChange={(value) => setNewGoal({ ...newGoal, subject: value })}
                    value={newGoal.subject}
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
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goal-target" className="col-span-1">
                  Meta
                </Label>
                <div className="col-span-2">
                  <Input
                    id="goal-target"
                    type="number"
                    value={newGoal.target || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                    placeholder="Ex: 100"
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    value={newGoal.unit || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    placeholder="Unidade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goal-deadline" className="col-span-1">
                  Prazo
                </Label>
                <div className="col-span-3">
                  <Calendar
                    mode="single"
                    selected={newGoal.deadline || undefined}
                    onSelect={(date) => setNewGoal({ ...newGoal, deadline: date })}
                    className="rounded-md border p-3 pointer-events-auto"
                    disabled={(date) => date < today}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goal-priority" className="col-span-1">
                  Prioridade
                </Label>
                <Select 
                  onValueChange={(value) => setNewGoal({ 
                    ...newGoal, 
                    priority: value as "high" | "medium" | "low" 
                  })}
                  value={newGoal.priority}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddGoal}>Criar Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Progresso Geral</CardTitle>
            <CardDescription>
              Sua visão geral de metas
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Metas concluídas</p>
                    <p className="text-2xl font-bold">
                      {goals.filter(g => g.current >= g.target).length}/{goals.length}
                    </p>
                  </div>
                </div>
                <Progress 
                  className="h-2 mt-2" 
                  value={(goals.filter(g => g.current >= g.target).length / goals.length) * 100} 
                />
              </div>

              {goals.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-4">Prazos Próximos</h3>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((goal) => (
                      <div key={goal.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${getPriorityColor(goal.priority)}`}>
                            {getTypeIcon(goal.type)}
                          </div>
                          <p className="text-sm font-medium">{goal.title}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {goal.deadline ? `${Math.ceil((goal.deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} dias` : "Sem prazo"}
                        </p>
                      </div>
                    ))}

                    {upcomingDeadlines.length === 0 && (
                      <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground">Nenhum prazo próximo</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <a href="#all-goals">
                Ver todas as metas
              </a>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Análise de Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Metas de Matérias</p>
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold mt-2">{subjectGoals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {subjectGoals.filter(g => g.current >= g.target).length} concluídas
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Metas de Tempo</p>
                  <Clock className="h-5 w-5 text-secondary" />
                </div>
                <p className="text-2xl font-bold mt-2">{timeGoals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {timeGoals.filter(g => g.current >= g.target).length} concluídas
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Metas de Tarefas</p>
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold mt-2">{taskGoals.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {taskGoals.filter(g => g.current >= g.target).length} concluídas
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-4">Metas em Andamento</h3>
              <div className="space-y-4">
                {goals
                  .filter((goal) => goal.current < goal.target)
                  .slice(0, 3)
                  .map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`${getPriorityColor(goal.priority)}`}>
                            {getTypeIcon(goal.type)}
                          </div>
                          <h3 className="font-medium text-sm">{goal.title}</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((goal.current / goal.target) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.current} de {goal.target} {goal.unit}</span>
                        <span>
                          {goal.deadline
                            ? `Prazo: ${goal.deadline.toLocaleDateString("pt-BR")}`
                            : "Sem prazo"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="mt-8" id="all-goals">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="subject">Matérias</TabsTrigger>
          <TabsTrigger value="time">Tempo</TabsTrigger>
          <TabsTrigger value="task">Tarefas</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {goals.length > 0 ? (
                  goals.map((goal) => (
                    <div key={goal.id} className="flex flex-col sm:flex-row gap-6 p-4 border rounded-lg relative">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`${getPriorityColor(goal.priority)}`}>
                            {getTypeIcon(goal.type)}
                          </div>
                          <h3 className="font-medium">{goal.title}</h3>
                        </div>
                        
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                          {goal.subject && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Matéria:</span> {goal.subject}
                            </div>
                          )}
                          
                          {goal.deadline && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {goal.deadline.toLocaleDateString("pt-BR")}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {goal.target} {goal.unit}
                          </div>
                          
                          <div className={`text-xs flex items-center gap-1 ${
                            goal.priority === "high" ? "text-destructive" :
                            goal.priority === "medium" ? "text-primary" : 
                            "text-secondary"
                          }`}>
                            <AlertTriangle className="h-3 w-3" />
                            {goal.priority === "high" ? "Alta" : 
                             goal.priority === "medium" ? "Média" : "Baixa"}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Progresso: {goal.current} de {goal.target}</span>
                            <span className="text-sm font-medium">
                              {Math.round((goal.current / goal.target) * 100)}%
                            </span>
                          </div>
                          <Progress
                            className="h-2 mt-1"
                            value={(goal.current / goal.target) * 100}
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUpdateProgress(goal.id, goal.current + 1)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span>Progresso</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">Nenhuma meta criada</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Crie sua primeira meta de estudo para começar a acompanhar seu progresso.
                    </p>
                    <Button className="mt-4" onClick={() => document.querySelector('[role="dialog"]')?.focus()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Meta
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Demais abas */}
        {["subject", "time", "task", "completed"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabValue === "subject" ? "Metas de Matérias" :
                   tabValue === "time" ? "Metas de Tempo" :
                   tabValue === "task" ? "Metas de Tarefas" : "Metas Concluídas"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goals.filter(goal => {
                    if (tabValue === "completed") {
                      return goal.current >= goal.target;
                    }
                    return goal.type === tabValue;
                  }).length > 0 ? (
                    goals.filter(goal => {
                      if (tabValue === "completed") {
                        return goal.current >= goal.target;
                      }
                      return goal.type === tabValue;
                    }).map((goal) => (
                      <div key={goal.id} className="flex flex-col sm:flex-row gap-6 p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`${getPriorityColor(goal.priority)}`}>
                              {getTypeIcon(goal.type)}
                            </div>
                            <h3 className="font-medium">{goal.title}</h3>
                          </div>
                          
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {goal.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                            {goal.subject && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Matéria:</span> {goal.subject}
                              </div>
                            )}
                            
                            {goal.deadline && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                {goal.deadline.toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Progresso: {goal.current} de {goal.target}</span>
                              <span className="text-sm font-medium">
                                {Math.round((goal.current / goal.target) * 100)}%
                              </span>
                            </div>
                            <Progress
                              className="h-2 mt-1"
                              value={(goal.current / goal.target) * 100}
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col gap-2 justify-end">
                          {tabValue !== "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUpdateProgress(goal.id, goal.current + 1)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              <span>Progresso</span>
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">
                        Nenhuma meta encontrada
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tabValue === "completed" 
                          ? "Complete algumas metas para vê-las aqui."
                          : `Crie uma meta do tipo ${
                              tabValue === "subject" ? "matéria" : 
                              tabValue === "time" ? "tempo" : "tarefa"
                            } para começar.`
                        }
                      </p>
                      <Button className="mt-4" onClick={() => document.querySelector('[role="dialog"]')?.focus()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Meta
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
