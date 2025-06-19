
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnemFilters } from "@/components/enem/EnemFilters";
import { EnemQuestionsList } from "@/components/enem/EnemQuestionsList";
import { useQuery } from "@tanstack/react-query";

interface EnemQuestion {
  id: number;
  year: number;
  number: number;
  discipline: string;
  subject: string;
  context: string;
  question: string;
  alternatives: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  answer: string;
  correctAlternative: string;
}

interface EnemFilters {
  year?: number;
  discipline?: string;
  subject?: string;
  page?: number;
  limit?: number;
}

export default function EnemQuestions() {
  const [filters, setFilters] = useState<EnemFilters>({
    limit: 10,
    page: 1
  });

  const { data: questionsData, isLoading, error } = useQuery({
    queryKey: ['enem-questions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.discipline) params.append('discipline', filters.discipline);
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`https://api.enem.dev/v1/exams/questions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar questões');
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      // A API retorna um array direto de questões, não um objeto com propriedade questions
      return {
        questions: Array.isArray(data) ? data : [],
        total: Array.isArray(data) ? data.length : 0,
        totalPages: Math.ceil((Array.isArray(data) ? data.length : 0) / (filters.limit || 10))
      };
    },
  });

  const handleFilterChange = (newFilters: EnemFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Banco de Questões do Enem</h1>
        <p className="text-muted-foreground">
          Explore questões do Enem organizadas por disciplina e assunto
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <EnemFilters onFilterChange={handleFilterChange} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Questões 
            {questionsData?.total && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({questionsData.total} encontradas)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnemQuestionsList 
            questions={questionsData?.questions || []}
            isLoading={isLoading}
            error={error}
            currentPage={filters.page || 1}
            totalPages={questionsData?.totalPages || 1}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
