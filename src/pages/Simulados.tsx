
import React, { useState } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { SimuladoDialog } from "@/components/simulados/SimuladoDialog";
import { SimuladosList } from "@/components/simulados/SimuladosList";
import { SimuladosChart } from "@/components/simulados/SimuladosChart";
import { SimuladosFilters } from "@/components/simulados/SimuladosFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Simulado {
  id: string;
  nome: string;
  data: string;
  instituicao: string;
  linguagens: number;
  humanas: number;
  natureza: number;
  matematica: number;
  redacao: number;
  notaTotal: number;
  questoesTotais: number;
  questoesAcertadas: number;
}

export default function Simulados() {
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState<Simulado | null>(null);
  const [filters, setFilters] = useState({
    ano: "",
    instituicao: "",
    area: "",
  });

  const handleAddSimulado = (simulado: Omit<Simulado, "id">) => {
    const newSimulado = {
      ...simulado,
      id: Date.now().toString(),
    };
    setSimulados([...simulados, newSimulado]);
    setIsDialogOpen(false);
  };

  const handleEditSimulado = (simulado: Simulado) => {
    setEditingSimulado(simulado);
    setIsDialogOpen(true);
  };

  const handleUpdateSimulado = (updatedSimulado: Omit<Simulado, "id">) => {
    if (editingSimulado) {
      setSimulados(simulados.map(s => 
        s.id === editingSimulado.id 
          ? { ...updatedSimulado, id: editingSimulado.id }
          : s
      ));
      setEditingSimulado(null);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteSimulado = (id: string) => {
    setSimulados(simulados.filter(s => s.id !== id));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSimulado(null);
  };

  const filteredSimulados = simulados.filter(simulado => {
    const year = new Date(simulado.data).getFullYear().toString();
    
    if (filters.ano && year !== filters.ano) return false;
    if (filters.instituicao && simulado.instituicao !== filters.instituicao) return false;
    
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <PageTitle 
          title="Simulados" 
          subtitle="Registre e acompanhe seus resultados em simulados do Enem e vestibulares" 
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Simulado
        </Button>
      </div>

      <Tabs defaultValue="lista" className="space-y-6">
        <TabsList>
          <TabsTrigger value="lista">Lista de Simulados</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-6">
          <SimuladosFilters filters={filters} onFiltersChange={setFilters} simulados={simulados} />
          <SimuladosList 
            simulados={filteredSimulados}
            onEdit={handleEditSimulado}
            onDelete={handleDeleteSimulado}
          />
        </TabsContent>

        <TabsContent value="graficos">
          <SimuladosChart simulados={filteredSimulados} />
        </TabsContent>
      </Tabs>

      <SimuladoDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={editingSimulado ? handleUpdateSimulado : handleAddSimulado}
        simulado={editingSimulado}
      />
    </div>
  );
}
