
import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart2, LineChart as LineChartIcon, PieChart, Download, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ProgressPage() {
  // Dados de exemplo para os gráficos
  const weeklyData = [
    { name: "Seg", hours: 3, goal: 4 },
    { name: "Ter", hours: 5, goal: 4 },
    { name: "Qua", hours: 2, goal: 4 },
    { name: "Qui", hours: 4, goal: 4 },
    { name: "Sex", hours: 6, goal: 4 },
    { name: "Sáb", hours: 3, goal: 2 },
    { name: "Dom", hours: 1, goal: 2 },
  ];

  const monthlyData = [
    { name: "Semana 1", hours: 20, goal: 24 },
    { name: "Semana 2", hours: 24, goal: 24 },
    { name: "Semana 3", hours: 18, goal: 24 },
    { name: "Semana 4", hours: 22, goal: 24 },
  ];

  const subjectData = [
    { name: "Matemática", horas: 12, progresso: 65, meta: 18, cor: "hsl(var(--primary))" },
    { name: "Física", horas: 8, progresso: 40, meta: 20, cor: "hsl(var(--secondary))" },
    { name: "Química", horas: 15, progresso: 75, meta: 20, cor: "hsl(var(--accent))" },
    { name: "Biologia", horas: 10, progresso: 50, meta: 20, cor: "hsl(var(--muted))" },
    { name: "História", horas: 18, progresso: 90, meta: 20, cor: "#f59e0b" },
  ];

  // Histórico de horas estudadas (últimos 30 dias)
  const historicalData = Array(30)
    .fill(0)
    .map((_, i) => ({
      date: `Dia ${i + 1}`,
      hours: Math.floor(Math.random() * 6) + 1,
    }));

  // Rendimento em avaliações simuladas
  const performanceData = [
    { name: "Simulado 1", nota: 65 },
    { name: "Simulado 2", nota: 72 },
    { name: "Simulado 3", nota: 68 },
    { name: "Simulado 4", nota: 75 },
    { name: "Simulado 5", nota: 82 },
  ];

  // Estado para controle de período
  const [period, setPeriod] = useState("semanal");

  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Progresso" 
        subtitle="Acompanhe sua evolução nos estudos"
      >
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Este mês
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </PageTitle>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subject">Por Matéria</TabsTrigger>
          <TabsTrigger value="historical">Histórico</TabsTrigger>
          <TabsTrigger value="performance">Rendimento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Horas Estudadas</CardTitle>
                <BarChart2 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={period === "semanal" ? weeklyData : monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Legend />
                      <Bar name="Horas Estudadas" dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar name="Meta" dataKey="goal" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2">
                  <Button 
                    variant={period === "semanal" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setPeriod("semanal")}
                  >
                    Semanal
                  </Button>
                  <Button 
                    variant={period === "mensal" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setPeriod("mensal")}
                  >
                    Mensal
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Estudo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Total de Horas (Este Mês)</p>
                      <p className="text-2xl font-bold">84h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Meta Mensal</p>
                      <p className="text-2xl font-bold">100h</p>
                    </div>
                  </div>
                  <Progress className="mt-2 h-2" value={84} />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Sessões Completadas</p>
                      <p className="text-2xl font-bold">28</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Sessões Planejadas</p>
                      <p className="text-2xl font-bold">32</p>
                    </div>
                  </div>
                  <Progress className="mt-2 h-2" value={87.5} />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Streak de Estudo</p>
                      <p className="text-2xl font-bold">5 dias</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Melhor Streak</p>
                      <p className="text-2xl font-bold">14 dias</p>
                    </div>
                  </div>
                  <Progress className="mt-2 h-2" value={35.7} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subject" className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Disciplina</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectData.map((subject) => (
                    <div key={subject.name} className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{subject.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {subject.horas} horas de {subject.meta} (Meta)
                          </p>
                        </div>
                        <p className="text-sm font-medium">{subject.progresso}%</p>
                      </div>
                      <Progress value={subject.progresso} className="h-2" indicatorColor={subject.cor} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Distribuição de Tempo</CardTitle>
                <PieChart className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectData}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                        formatter={(value) => [`${value} horas`]}
                      />
                      <Legend />
                      <Bar name="Horas Estudadas" dataKey="horas" fill="hsl(var(--primary))" />
                      <Bar name="Meta" dataKey="meta" fill="hsl(var(--muted))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="historical" className="animate-fade-in">
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Histórico de Estudos (30 dias)</CardTitle>
              <LineChartIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historicalData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" 
                      tick={false}
                      tickLine={false}
                      axisLine={true}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value) => [`${value} horas`]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      name="Horas Estudadas"
                      dataKey="hours"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Dados
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="animate-fade-in">
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rendimento em Simulados</CardTitle>
              <LineChartIcon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                      }}
                      formatter={(value) => [`${value}/100`]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      name="Nota"
                      dataKey="nota"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 space-y-4">
                <h3 className="font-medium text-lg">Análise de Desempenho</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Média</p>
                    <p className="text-2xl font-bold">
                      {(performanceData.reduce((acc, item) => acc + item.nota, 0) / performanceData.length).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Maior Nota</p>
                    <p className="text-2xl font-bold text-secondary">
                      {Math.max(...performanceData.map(item => item.nota))}%
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Evolução</p>
                    <p className="text-2xl font-bold text-primary">
                      +{Math.round((performanceData[performanceData.length - 1].nota - performanceData[0].nota))}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
