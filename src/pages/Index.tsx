
import React from "react";
import { useAuth } from "@/lib/auth";
import { SubjectProgress } from "@/components/dashboard/SubjectProgress";
import { StudyTasks } from "@/components/dashboard/StudyTasks";
import { NextStudySessions } from "@/components/dashboard/NextStudySessions";
import { StudyChart } from "@/components/dashboard/StudyChart";
import { QuestionsStats } from "@/components/dashboard/QuestionsStats";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudyTimeButton } from "@/components/study/StudyTimeButton";

export default function Index() {
  const { user } = useAuth();
  
  // Sample data for components
  const tasks = [
    { id: "1", title: "Revisão de Matemática", subject: "Matemática", time: "09:00 - 10:30", duration: "1h 30min", status: "completed" as const },
    { id: "2", title: "Exercícios de Física", subject: "Física", time: "11:00 - 12:30", duration: "1h 30min", status: "upcoming" as const },
  ];
  
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
  
  const subjectsData = [
    { id: "1", name: "Matemática", progress: 65, color: "bg-primary", totalTopics: 12, totalQuestions: 85, correctQuestions: 65 },
    { id: "2", name: "Física", progress: 40, color: "bg-secondary", totalTopics: 8, totalQuestions: 62, correctQuestions: 25 },
    { id: "3", name: "Química", progress: 75, color: "bg-accent", totalTopics: 10, totalQuestions: 95, correctQuestions: 71 },
  ];
  
  const sessionsData = [
    { id: "1", title: "Química Orgânica", subject: "Química", date: "Amanhã", time: "09:00 - 10:30", duration: "1h 30min" },
    { id: "2", title: "Geometria", subject: "Matemática", date: "Amanhã", time: "11:00 - 12:30", duration: "1h 30min" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olá, {user?.user_metadata?.nome || 'Estudante'}</h1>
          <p className="text-muted-foreground">Veja seu progresso e continue os estudos</p>
        </div>
        <StudyTimeButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Horas de Estudo" value="32" description="Este mês" />
        <StatCard title="Questões" value="287" description="Resolvidas" />
        <StatCard title="Aproveitamento" value="74%" description="de acertos" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StudyStreak {...streakData} />
        <StudyChart className="lg:col-span-2" data={chartData} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuestionsStats />
        <NextStudySessions sessions={sessionsData} />
        <SubjectProgress subjects={subjectsData} />
      </div>

      <StudyTasks tasks={tasks} />
    </div>
  );
}
