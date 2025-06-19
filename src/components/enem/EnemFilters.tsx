
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface EnemFiltersProps {
  onFilterChange: (filters: {
    year?: number;
    discipline?: string;
    subject?: string;
    limit?: number;
  }) => void;
}

export function EnemFilters({ onFilterChange }: EnemFiltersProps) {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLimit, setSelectedLimit] = useState<string>("10");

  // Fetch available exams to get years and disciplines
  const { data: examsData } = useQuery({
    queryKey: ['enem-exams'],
    queryFn: async () => {
      const response = await fetch('https://api.enem.dev/v1/exams');
      if (!response.ok) throw new Error('Erro ao carregar dados dos exames');
      return response.json();
    },
  });

  // Extract years from exams data
  const availableYears = examsData ? examsData.map((exam: any) => exam.year).sort((a: number, b: number) => b - a) : [];
  
  // Extract disciplines from exams data (get from the most recent exam)
  const availableDisciplines = examsData && examsData.length > 0 
    ? examsData[0].disciplines.map((discipline: any) => ({
        label: discipline.label,
        value: discipline.value
      }))
    : [];

  // Fetch subjects based on selected discipline
  const { data: subjectsData } = useQuery({
    queryKey: ['enem-subjects', selectedDiscipline],
    queryFn: async () => {
      if (selectedDiscipline === "all") return [];
      const response = await fetch(`https://api.enem.dev/v1/subjects?discipline=${selectedDiscipline}`);
      if (!response.ok) throw new Error('Erro ao carregar assuntos');
      return response.json();
    },
    enabled: selectedDiscipline !== "all",
  });

  const handleApplyFilters = () => {
    const filters: any = {
      limit: parseInt(selectedLimit)
    };

    if (selectedYear !== "all") filters.year = parseInt(selectedYear);
    if (selectedDiscipline !== "all") filters.discipline = selectedDiscipline;
    if (selectedSubject !== "all") filters.subject = selectedSubject;

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setSelectedYear("all");
    setSelectedDiscipline("all");
    setSelectedSubject("all");
    setSelectedLimit("10");
    onFilterChange({ limit: 10 });
  };

  // Clear subject when discipline changes
  useEffect(() => {
    if (selectedDiscipline !== "all") {
      setSelectedSubject("all");
    }
  }, [selectedDiscipline]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Ano</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map((year: number) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Disciplina</label>
          <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as disciplinas</SelectItem>
              {availableDisciplines.map((discipline: any) => (
                <SelectItem key={discipline.value} value={discipline.value}>
                  {discipline.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assunto</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={selectedDiscipline === "all"}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o assunto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os assuntos</SelectItem>
              {subjectsData?.map((subject: string) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Questões por página</label>
          <Select value={selectedLimit} onValueChange={setSelectedLimit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1 md:flex-none">
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={handleClearFilters} className="flex-1 md:flex-none">
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
