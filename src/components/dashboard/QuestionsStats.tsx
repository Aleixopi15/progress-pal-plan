
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface QuestionStatsSummary {
  correct: number;
  incorrect: number;
  total: number;
  correctPercentage: number;
}

export function QuestionsStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuestionStatsSummary>({
    correct: 0,
    incorrect: 0,
    total: 0,
    correctPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchQuestionStats();
    }
  }, [user]);

  async function fetchQuestionStats() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("questions")
        .select("is_correct")
        .eq("user_id", user?.id);

      if (error) {
        throw error;
      }

      const totalQuestions = data?.length || 0;
      const correctQuestions = data?.filter(q => q.is_correct)?.length || 0;
      const incorrectQuestions = totalQuestions - correctQuestions;
      const correctPercentage = totalQuestions > 0 
        ? Math.round((correctQuestions / totalQuestions) * 100) 
        : 0;

      setStats({
        correct: correctQuestions,
        incorrect: incorrectQuestions,
        total: totalQuestions,
        correctPercentage
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas de questões:", error);
    } finally {
      setLoading(false);
    }
  }

  // Dados para o gráfico de pizza
  const chartData = [
    { name: "Acertos", value: stats.correct, color: "#10B981" }, // verde
    { name: "Erros", value: stats.incorrect, color: "#EF4444" }, // vermelho
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho em Questões</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <p className="text-muted-foreground">Carregando estatísticas...</p>
          </div>
        ) : stats.total === 0 ? (
          <div className="flex justify-center items-center h-[200px]">
            <p className="text-muted-foreground">Nenhuma questão respondida</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-muted-foreground text-sm">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-green-600 text-sm">Acertos</p>
                <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
              </div>
              <div>
                <p className="text-red-600 text-sm">Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.incorrect}</p>
              </div>
            </div>

            <div className="flex justify-center h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} questões`, undefined]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Aproveitamento Geral</p>
              <p className="text-2xl font-bold">{stats.correctPercentage}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
