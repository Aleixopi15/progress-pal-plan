
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, X } from "lucide-react";
import { Simulado } from "@/pages/Simulados";

interface FiltersType {
  ano: string;
  instituicao: string;
  area: string;
}

interface SimuladosFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  simulados: Simulado[];
}

export function SimuladosFilters({ filters, onFiltersChange, simulados }: SimuladosFiltersProps) {
  const uniqueYears = Array.from(
    new Set(simulados.map(s => new Date(s.data).getFullYear().toString()))
  ).sort((a, b) => b.localeCompare(a));

  const uniqueInstituicoes = Array.from(
    new Set(simulados.map(s => s.instituicao))
  ).sort();

  const clearFilters = () => {
    onFiltersChange({ ano: "", instituicao: "", area: "" });
  };

  const hasActiveFilters = filters.ano || filters.instituicao || filters.area;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Ano</label>
            <Select
              value={filters.ano}
              onValueChange={(value) => onFiltersChange({ ...filters, ano: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os anos</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Instituição</label>
            <Select
              value={filters.instituicao}
              onValueChange={(value) => onFiltersChange({ ...filters, instituicao: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as instituições" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as instituições</SelectItem>
                {uniqueInstituicoes.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Área de Conhecimento</label>
            <Select
              value={filters.area}
              onValueChange={(value) => onFiltersChange({ ...filters, area: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as áreas</SelectItem>
                <SelectItem value="linguagens">Linguagens</SelectItem>
                <SelectItem value="humanas">Ciências Humanas</SelectItem>
                <SelectItem value="natureza">Ciências da Natureza</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
                <SelectItem value="redacao">Redação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
