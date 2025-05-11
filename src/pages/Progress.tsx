import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, BarChart2, BookOpen, Calendar, Clock, Target } from "lucide-react";
import { Area, AreaChart, Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Example data for charts
const weeklyData = [
  { day: 'Dom', hours: 1.5 },
  { day: 'Seg', hours: 3 },
  { day: 'Ter', hours: 2.5 },
  { day: 'Qua', hours: 4 },
  { day: 'Qui', hours: 3.5 },
  { day: 'Sex', hours: 2 },
  { day: 'Sáb', hours: 1 },
];

export default function Progress() {
  // Component state and functions
  
  return (
    <div className="animate-fade-in">
      <PageTitle title="Progresso" subtitle="Acompanhe sua evolução nos estudos" />
      
      {/* Content with fixed Progress components */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Disciplina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Matemática</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Física</span>
                  <span>60%</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Química</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Biologia</span>
                  <span>80%</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>História</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Geografia</span>
                  <span>50%</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Português</span>
                  <span>70%</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Horas de Estudo por Dia</CardTitle>
              <CardDescription>Últimos 7 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" name="Horas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Progresso ao Longo do Tempo</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { day: '1', progress: 20 },
                    { day: '5', progress: 25 },
                    { day: '10', progress: 35 },
                    { day: '15', progress: 45 },
                    { day: '20', progress: 55 },
                    { day: '25', progress: 65 },
                    { day: '30', progress: 70 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="progress" stroke="hsl(var(--primary))" name="Progresso %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Clock className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-2xl font-bold">124</h3>
                <p className="text-sm text-muted-foreground">Horas Totais</p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-2xl font-bold">42</h3>
                <p className="text-sm text-muted-foreground">Dias de Estudo</p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-2xl font-bold">8</h3>
                <p className="text-sm text-muted-foreground">Matérias</p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-primary mb-2" />
                <h3 className="text-2xl font-bold">65%</h3>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tempo por Matéria</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={[
                  { subject: 'Mat', hours: 24 },
                  { subject: 'Fís', hours: 18 },
                  { subject: 'Quí', hours: 12 },
                  { subject: 'Bio', hours: 15 },
                  { subject: 'His', hours: 10 },
                  { subject: 'Geo', hours: 8 },
                  { subject: 'Por', hours: 20 },
                  { subject: 'Ing', hours: 6 },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="subject" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="hsl(var(--primary))" name="Horas" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho em Simulados</CardTitle>
              <CardDescription>Últimos 5 simulados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { id: 1, score: 65 },
                    { id: 2, score: 70 },
                    { id: 3, score: 68 },
                    { id: 4, score: 75 },
                    { id: 5, score: 82 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" label={{ value: 'Simulado', position: 'insideBottom', offset: -5 }} />
                  <YAxis domain={[0, 100]} label={{ value: 'Pontuação', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" name="Pontuação" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Progresso nas Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta de Estudo Semanal</span>
                    <span>24/30 horas</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conclusão do Material</span>
                    <span>65/100 %</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exercícios Resolvidos</span>
                    <span>120/200</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Simulados Realizados</span>
                    <span>5/10</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
