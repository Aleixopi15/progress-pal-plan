
import { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Revisão de Matemática",
      subject: "Matemática",
      time: "09:00 - 10:30",
      duration: "1h 30min",
      status: "completed" as const,
    },
    {
      id: "2",
      title: "Exercícios de Física",
      subject: "Física",
      time: "11:00 - 12:30",
      duration: "1h 30min",
      status: "upcoming" as const,
    },
    {
      id: "3",
      title: "Leitura de História",
      subject: "História",
      time: "14:00 - 15:30",
      duration: "1h 30min",
      status: "upcoming" as const,
    },
    {
      id: "4",
      title: "Redação",
      subject: "Português",
      time: "16:00 - 17:30",
      duration: "1h 30min",
      status: "missed" as const,
    },
  ]);

  const handleCompleteTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: "completed" as const } : task
      )
    );
  };

  const chartData = [
    { name: "Seg", hours: 3, goal: 4 },
    { name: "Ter", hours: 5, goal: 4 },
    { name: "Qua", hours: 2, goal: 4 },
    { name: "Qui", hours: 4, goal: 4 },
    { name: "Sex", hours: 6, goal: 4 },
    { name: "Sáb", hours: 3, goal: 2 },
    { name: "Dom", hours: 1, goal: 2 },
  ];

  const streakData = {
    currentStreak: 5,
    days: [
      { date: "Seg", hasStudied: true },
      { date: "Ter", hasStudied: true },
      { date: "Qua", hasStudied: true },
      { date: "Qui", hasStudied: true },
      { date: "Sex", hasStudied: true },
      { date: "Sáb", hasStudied: false },
      { date: "Dom", hasStudied: false },
    ],
  };

  const subjects = [
    { name: "Matemática", progress: 65, color: "bg-primary" },
    { name: "Física", progress: 40, color: "bg-secondary" },
    { name: "Química", progress: 75, color: "bg-accent" },
    { name: "Biologia", progress: 50, color: "bg-[#f59e0b]" },
    { name: "História", progress: 90, color: "bg-[#10b981]" },
  ];

  const nextSessions = [
    {
      id: "1",
      title: "Química Orgânica",
      subject: "Química",
      date: "Amanhã",
      time: "09:00 - 10:30",
      duration: "1h 30min",
    },
    {
      id: "2",
      title: "Geometria",
      subject: "Matemática",
      date: "Amanhã",
      time: "11:00 - 12:30",
      duration: "1h 30min",
    },
    {
      id: "3",
      title: "Literatura Brasileira",
      subject: "Português",
      date: "Depois de amanhã",
      time: "09:00 - 10:30",
      duration: "1h 30min",
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageTitle title="Dashboard" subtitle="Bem-vindo(a) de volta!">
        <Button>Planejar Nova Sessão</Button>
      </PageTitle>

      <div className="mt-6 grid gap-6 lg:grid-cols-4">
        <StatCard
          title="Horas Estudadas Hoje"
          value="3h 30min"
          icon={<Clock className="h-5 w-5" />}
          description="Meta diária: 6h"
        />
        <StatCard
          title="Total de Matérias"
          value="8"
          icon={<BookOpen className="h-5 w-5" />}
          description="2 matérias em dia"
        />
        <StatCard
          title="Metas Concluídas"
          value="5/9"
          icon={<Target className="h-5 w-5" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Streak Atual"
          value="5 dias"
          icon={<Award className="h-5 w-5" />}
          description="Melhor: 14 dias"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horas de Estudo na Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progresso Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyStreak {...streakData} />
            <div className="mt-6">
              <SubjectProgress subjects={subjects} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudyTasks tasks={tasks} onComplete={handleCompleteTask} />
        </div>
        <div>
          <NextStudySessions sessions={nextSessions} />
        </div>
      </div>
    </div>
  );
}
