
import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, Bell, Mail, Upload, Save, Check, BarChart2, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const [user, setUser] = useState({
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    image: "",
    bio: "Estudante de Engenharia, focado em concursos públicos da área técnica e preparação para mestrado.",
    courseType: "Concurso Público",
    studyGoal: "Aprovação no concurso da Petrobrás até o final do ano.",
    dailyGoalHours: 4,
    weeklyGoalHours: 24,
    subjects: ["Matemática", "Física", "Português", "Inglês", "Conhecimentos Específicos"],
    successMetrics: ["Aprovação", "Simulados com nota acima de 80%", "Concluir todo o conteúdo"],
    joined: new Date(2024, 2, 15),
    notifications: {
      email: true,
      push: true,
      reminders: true,
      weeklyReport: true,
    },
  });

  // Dados simulados de desempenho e conquistas
  const achievements = [
    { id: "1", title: "Primeira Semana", description: "Completou uma semana de estudos", date: "10/04/2025", icon: "🏆" },
    { id: "2", title: "Maratonista", description: "Estudou por 7 dias consecutivos", date: "15/04/2025", icon: "🔥" },
    { id: "3", title: "Matemático", description: "Completou 100% do conteúdo de Matemática", date: "22/04/2025", icon: "📚" },
    { id: "4", title: "Dedicação Total", description: "Atingiu 50 horas de estudo", date: "01/05/2025", icon: "⏰" },
    { id: "5", title: "Mestre dos Simulados", description: "Nota acima de 80% em 3 simulados consecutivos", date: "10/05/2025", icon: "🎯" },
  ];

  const activityData = [
    { date: "12/05/2025", activity: "Completou sessão de estudo", subject: "Física", duration: "2 horas" },
    { date: "11/05/2025", activity: "Concluiu simulado", subject: "Geral", score: "85%" },
    { date: "10/05/2025", activity: "Completou sessão de estudo", subject: "Matemática", duration: "3 horas" },
    { date: "09/05/2025", activity: "Adicionou novos recursos", count: 3, subject: "Português" },
    { date: "09/05/2025", activity: "Completou sessão de estudo", subject: "Inglês", duration: "1.5 horas" },
    { date: "08/05/2025", activity: "Definiu nova meta", title: "Completar módulo de cálculo" },
    { date: "08/05/2025", activity: "Completou sessão de estudo", subject: "Conhecimentos Específicos", duration: "2.5 horas" },
  ];

  const performanceData = {
    streak: 5,
    totalHours: 124,
    completedGoals: 8,
    totalGoals: 12,
    completedTasks: 45,
    totalTasks: 60,
    averageScores: [
      { subject: "Matemática", score: 85 },
      { subject: "Física", score: 78 },
      { subject: "Português", score: 92 },
      { subject: "Inglês", score: 88 },
      { subject: "Conhecimentos Específicos", score: 72 },
    ],
  };

  // Estado para controle de formulário
  const [formState, setFormState] = useState({ ...user });
  const [notificationSettings, setNotificationSettings] = useState({ ...user.notifications });

  const handleProfileUpdate = () => {
    setUser({ ...formState });
    // Simulação de toast de sucesso
    alert("Perfil atualizado com sucesso!");
  };

  const handleNotificationUpdate = () => {
    setUser({
      ...user,
      notifications: notificationSettings,
    });
    // Simulação de toast de sucesso
    alert("Configurações de notificação atualizadas!");
  };

  // Iniciais para o Avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Perfil" 
        subtitle="Gerencie suas informações pessoais"
      />

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Aba de Perfil */}
        <TabsContent value="profile" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Seu Perfil</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2">
                    <Badge>{user.courseType}</Badge>
                  </div>
                  <p className="mt-4 text-sm">{user.bio}</p>
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-between text-sm">
                      <span>Membro desde</span>
                      <span>{user.joined.toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Alterar Foto
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Conquistas</CardTitle>
                  <CardDescription>Seus objetivos alcançados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
                          {achievement.icon}
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full">
                    Ver Todas as Conquistas
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        rows={3}
                        value={formState.bio}
                        onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseType">Tipo de Preparação</Label>
                        <Select
                          value={formState.courseType}
                          onValueChange={(value) => setFormState({ ...formState, courseType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Concurso Público">Concurso Público</SelectItem>
                            <SelectItem value="ENEM">ENEM</SelectItem>
                            <SelectItem value="Vestibular">Vestibular</SelectItem>
                            <SelectItem value="Residência Médica">Residência Médica</SelectItem>
                            <SelectItem value="Graduação">Graduação</SelectItem>
                            <SelectItem value="Pós-Graduação">Pós-Graduação</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dailyGoal">Meta Diária (horas)</Label>
                        <Input
                          id="dailyGoal"
                          type="number"
                          min="1"
                          max="24"
                          value={formState.dailyGoalHours}
                          onChange={(e) => setFormState({ ...formState, dailyGoalHours: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="studyGoal">Objetivo de Estudo</Label>
                      <Textarea
                        id="studyGoal"
                        rows={2}
                        value={formState.studyGoal}
                        onChange={(e) => setFormState({ ...formState, studyGoal: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button onClick={handleProfileUpdate}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityData.map((activity, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="rounded-full p-1.5 bg-muted">
                          {activity.activity.includes("sessão") ? (
                            <CalendarCheck className="h-4 w-4 text-primary" />
                          ) : activity.activity.includes("simulado") ? (
                            <BarChart2 className="h-4 w-4 text-secondary" />
                          ) : (
                            <Check className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {activity.activity}
                              {activity.subject && ` - ${activity.subject}`}
                              {activity.title && ` - "${activity.title}"`}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-x-4">
                            <span>{activity.date}</span>
                            {activity.duration && <span>{activity.duration}</span>}
                            {activity.score && <span>Nota: {activity.score}</span>}
                            {activity.count && <span>{activity.count} recursos</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Aba de Desempenho */}
        <TabsContent value="performance" className="animate-fade-in mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Streak de Estudo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{performanceData.streak}</p>
                  <p className="text-sm text-muted-foreground">dias consecutivos</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total de Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{performanceData.totalHours}</p>
                  <p className="text-sm text-muted-foreground">horas de estudo</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Metas Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{performanceData.completedGoals}/{performanceData.totalGoals}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((performanceData.completedGoals / performanceData.totalGoals) * 100)}% concluído
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tarefas Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold">{performanceData.completedTasks}/{performanceData.totalTasks}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((performanceData.completedTasks / performanceData.totalTasks) * 100)}% concluído
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho por Disciplina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceData.averageScores.map((subject, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between">
                        <p className="font-medium">{subject.subject}</p>
                        <p>{subject.score}%</p>
                      </div>
                      <Progress value={subject.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Desbloqueadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.date}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Aba de Configurações */}
        <TabsContent value="settings" className="animate-fade-in mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notificações</CardTitle>
                  <CardDescription>Gerencie como deseja receber alertas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email_notifications">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes e atualizações por email
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, email: checked })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push_notifications">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba alertas no navegador
                      </p>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, push: checked })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminder_notifications">Lembretes de Estudo</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes antes das sessões de estudo agendadas
                      </p>
                    </div>
                    <Switch
                      id="reminder_notifications"
                      checked={notificationSettings.reminders}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, reminders: checked })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly_report">Relatório Semanal</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba um resumo semanal do seu progresso
                      </p>
                    </div>
                    <Switch
                      id="weekly_report"
                      checked={notificationSettings.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button onClick={handleNotificationUpdate}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>Gerencie a segurança da sua conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Senha Atual</Label>
                      <Input id="current_password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new_password">Nova Senha</Label>
                      <Input id="new_password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirmar Senha</Label>
                      <Input id="confirm_password" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button>Alterar Senha</Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exportar Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Baixe seus dados de estudo para uso offline ou backup.
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Progresso
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Calendário
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar Recursos
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Alterar Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    Gerenciar Notificações
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    Privacidade
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Excluir Conta
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
