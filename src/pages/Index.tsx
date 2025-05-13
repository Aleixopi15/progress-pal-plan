
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
        <StatCard title="Horas de Estudo" value="32" subtitle="Este mês" />
        <StatCard title="Questões" value="287" subtitle="Resolvidas" />
        <StatCard title="Aproveitamento" value="74%" subtitle="de acertos" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StudyStreak className="lg:col-span-1" />
        <StudyChart className="lg:col-span-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuestionsStats className="md:col-span-1" />
        <NextStudySessions className="md:col-span-1" />
        <SubjectProgress className="md:col-span-2 lg:col-span-1" />
      </div>

      <StudyTasks />
    </div>
  );
}
