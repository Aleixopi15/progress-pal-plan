
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Simulado } from "@/pages/Simulados";
import { TrendingUp, BarChart3 } from "lucide-react";

interface SimuladosChartProps {
  simulados: Simulado[];
}

export function SimuladosChart({ simulados }: SimuladosChartProps) {
  if (simulados.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Dados insuficientes para gráficos
        </h3>
        <p className="text-muted-foreground">
          Cadastre pelo menos um simulado para visualizar os gráficos de evolução.
        </p>
      </div>
    );
  }

  // Preparar dados para os gráficos
  const chartData = simulados
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((simulado, index) => ({
      simulado: `${simulado.nome.substring(0, 15)}...`,
      data: new Date(simulado.data).toLocaleDateString("pt-BR"),
      notaTotal: simulado.notaTotal,
      linguagens: simulado.linguagens,
      humanas: simulado.humanas,
      natureza: simulado.natureza,
      matematica: simulado.matematica,
      redacao: simulado.redacao,
      percentualAcertos: simulado.questoesTotais > 0 
        ? Math.round((simulado.questoesAcertadas / simulado.questoesTotais) * 100)
        : 0,
      index: index + 1,
    }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="evolucao" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="evolucao">Evolução da Nota Total</TabsTrigger>
          <TabsTrigger value="acertos">Acertos por Área</TabsTrigger>
          <TabsTrigger value="percentual">Percentual de Acertos</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução da Nota Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="index" 
                    tickFormatter={(value) => `${value}º`}
                  />
                  <YAxis domain={[0, 1000]} />
                  <Tooltip 
                    labelFormatter={(value) => `${value}º Simulado`}
                    formatter={(value: any, name: string) => [
                      value,
                      name === "notaTotal" ? "Nota Total" : name
                    ]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="notaTotal" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    name="Nota Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acertos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Acertos por Área de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="index" 
                    tickFormatter={(value) => `${value}º`}
                  />
                  <YAxis domain={[0, 45]} />
                  <Tooltip 
                    labelFormatter={(value) => `${value}º Simulado`}
                    formatter={(value: any, name: string) => [
                      `${value} acertos`,
                      name === "linguagens" ? "Linguagens" :
                      name === "humanas" ? "Humanas" :
                      name === "natureza" ? "Natureza" :
                      name === "matematica" ? "Matemática" : name
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="linguagens" fill="hsl(var(--primary))" name="Linguagens" />
                  <Bar dataKey="humanas" fill="hsl(var(--secondary))" name="Humanas" />
                  <Bar dataKey="natureza" fill="hsl(var(--accent))" name="Natureza" />
                  <Bar dataKey="matematica" fill="#8884d8" name="Matemática" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="percentual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Evolução do Percentual de Acertos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="index" 
                    tickFormatter={(value) => `${value}º`}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => `${value}º Simulado`}
                    formatter={(value: any) => [`${value}%`, "Percentual de Acertos"]}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="percentualAcertos" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 6 }}
                    name="Percentual de Acertos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
