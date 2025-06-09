
import React, { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SimuladoDialog } from "@/components/simulados/SimuladoDialog";
import { SimuladosList } from "@/components/simulados/SimuladosList";
import { SimuladosChart } from "@/components/simulados/SimuladosChart";
import { SimuladosFilters } from "@/components/simulados/SimuladosFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [simulados, setSimulados] = useState<Simulado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState<Simulado | null>(null);
  const [filters, setFilters] = useState({
    ano: "",
    instituicao: "",
    area: "",
  });

  useEffect(() => {
    if (user) {
      fetchSimulados();
    }
  }, [user]);

  const fetchSimulados = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('simulados')
        .select('*')
        .eq('user_id', user?.id)
        .order('data', { ascending: false });

      if (error) throw error;

      const formattedSimulados = data?.map(item => ({
        id: item.id,
        nome: item.nome,
        data: item.data,
        instituicao: item.instituicao,
        linguagens: item.linguagens || 0,
        humanas: item.humanas || 0,
        natureza: item.natureza || 0,
        matematica: item.matematica || 0,
        redacao: item.redacao || 0,
        notaTotal: item.nota_total || 0,
        questoesTotais: item.questoes_totais || 0,
        questoesAcertadas: item.questoes_acertadas || 0,
      })) || [];

      setSimulados(formattedSimulados);
    } catch (error) {
      console.error("Error fetching simulados:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar simulados",
        description: "Não foi possível carregar os dados dos simulados."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSimulado = async (simulado: Omit<Simulado, "id">) => {
    try {
      const { data, error } = await supabase
        .from('simulados')
        .insert({
          user_id: user?.id,
          nome: simulado.nome,
          data: simulado.data,
          instituicao: simulado.instituicao,
          linguagens: simulado.linguagens,
          humanas: simulado.humanas,
          natureza: simulado.natureza,
          matematica: simulado.matematica,
          redacao: simulado.redacao,
          nota_total: simulado.notaTotal,
          questoes_totais: simulado.questoesTotais,
          questoes_acertadas: simulado.questoesAcertadas,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchSimulados();
      setIsDialogOpen(false);
      
      toast({
        title: "Simulado adicionado!",
        description: "O simulado foi registrado com sucesso."
      });
    } catch (error) {
      console.error("Error adding simulado:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar simulado",
        description: "Não foi possível adicionar o simulado."
      });
    }
  };

  const handleEditSimulado = (simulado: Simulado) => {
    setEditingSimulado(simulado);
    setIsDialogOpen(true);
  };

  const handleUpdateSimulado = async (updatedSimulado: Omit<Simulado, "id">) => {
    if (!editingSimulado) return;

    try {
      const { error } = await supabase
        .from('simulados')
        .update({
          nome: updatedSimulado.nome,
          data: updatedSimulado.data,
          instituicao: updatedSimulado.instituicao,
          linguagens: updatedSimulado.linguagens,
          humanas: updatedSimulado.humanas,
          natureza: updatedSimulado.natureza,
          matematica: updatedSimulado.matematica,
          redacao: updatedSimulado.redacao,
          nota_total: updatedSimulado.notaTotal,
          questoes_totais: updatedSimulado.questoesTotais,
          questoes_acertadas: updatedSimulado.questoesAcertadas,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingSimulado.id);

      if (error) throw error;

      await fetchSimulados();
      setEditingSimulado(null);
      setIsDialogOpen(false);
      
      toast({
        title: "Simulado atualizado!",
        description: "As alterações foram salvas com sucesso."
      });
    } catch (error) {
      console.error("Error updating simulado:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar simulado",
        description: "Não foi possível salvar as alterações."
      });
    }
  };

  const handleDeleteSimulado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('simulados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSimulados();
      
      toast({
        title: "Simulado excluído!",
        description: "O simulado foi removido com sucesso."
      });
    } catch (error) {
      console.error("Error deleting simulado:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir simulado",
        description: "Não foi possível excluir o simulado."
      });
    }
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

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageTitle 
          title="Simulados" 
          subtitle="Carregando..." 
        />
      </div>
    );
  }

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
