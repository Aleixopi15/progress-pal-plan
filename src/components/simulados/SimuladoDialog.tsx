
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Simulado } from "@/pages/Simulados";

interface SimuladoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (simulado: Omit<Simulado, "id">) => void;
  simulado?: Simulado | null;
}

export function SimuladoDialog({ open, onClose, onSubmit, simulado }: SimuladoDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    data: "",
    instituicao: "",
    linguagens: 0,
    humanas: 0,
    natureza: 0,
    matematica: 0,
    redacao: 0,
    questoesTotais: 180,
    questoesAcertadas: 0,
  });

  useEffect(() => {
    if (simulado && open) {
      setFormData({
        nome: simulado.nome,
        data: simulado.data,
        instituicao: simulado.instituicao,
        linguagens: simulado.linguagens,
        humanas: simulado.humanas,
        natureza: simulado.natureza,
        matematica: simulado.matematica,
        redacao: simulado.redacao,
        questoesTotais: simulado.questoesTotais,
        questoesAcertadas: simulado.questoesAcertadas,
      });
    } else if (open) {
      setFormData({
        nome: "",
        data: "",
        instituicao: "",
        linguagens: 0,
        humanas: 0,
        natureza: 0,
        matematica: 0,
        redacao: 0,
        questoesTotais: 180,
        questoesAcertadas: 0,
      });
    }
  }, [simulado, open]);

  // Calculate total score based on correct answers and essay score
  const calculateTotalScore = () => {
    const objectiveQuestionsCorrect = formData.linguagens + formData.humanas + formData.natureza + formData.matematica;
    const objectiveScore = objectiveQuestionsCorrect * 5; // Assuming 5 points per correct objective question
    const totalScore = objectiveScore + formData.redacao;
    return totalScore;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalScore = calculateTotalScore();
    const totalCorrect = formData.linguagens + formData.humanas + formData.natureza + formData.matematica;
    
    onSubmit({
      ...formData,
      notaTotal: totalScore,
      questoesAcertadas: totalCorrect,
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {simulado ? "Editar Simulado" : "Novo Simulado"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Simulado</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: ENEM 2023 - 1º Dia"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instituicao">Instituição</Label>
            <Input
              id="instituicao"
              value={formData.instituicao}
              onChange={(e) => handleInputChange('instituicao', e.target.value)}
              placeholder="Ex: INEP, Fuvest, Unicamp"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Acertos por Área de Conhecimento</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linguagens">Linguagens (acertos)</Label>
                <Input
                  id="linguagens"
                  type="number"
                  min="0"
                  max="45"
                  value={formData.linguagens}
                  onChange={(e) => handleInputChange('linguagens', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 35"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="humanas">Humanas (acertos)</Label>
                <Input
                  id="humanas"
                  type="number"
                  min="0"
                  max="45"
                  value={formData.humanas}
                  onChange={(e) => handleInputChange('humanas', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="natureza">Ciências da Natureza (acertos)</Label>
                <Input
                  id="natureza"
                  type="number"
                  min="0"
                  max="45"
                  value={formData.natureza}
                  onChange={(e) => handleInputChange('natureza', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 28"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="matematica">Matemática (acertos)</Label>
                <Input
                  id="matematica"
                  type="number"
                  min="0"
                  max="45"
                  value={formData.matematica}
                  onChange={(e) => handleInputChange('matematica', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 25"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Redação e Questões</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="redacao">Nota da Redação</Label>
                <Input
                  id="redacao"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.redacao}
                  onChange={(e) => handleInputChange('redacao', parseInt(e.target.value) || 0)}
                  placeholder="Ex: 800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="questoesTotais">Total de Questões Objetivas</Label>
                <Input
                  id="questoesTotais"
                  type="number"
                  min="1"
                  value={formData.questoesTotais}
                  onChange={(e) => handleInputChange('questoesTotais', parseInt(e.target.value) || 180)}
                  placeholder="Ex: 180"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Resumo Calculado:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total de acertos objetivos:</span>
                <span className="ml-2 font-medium">
                  {formData.linguagens + formData.humanas + formData.natureza + formData.matematica}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Nota total estimada:</span>
                <span className="ml-2 font-medium">{calculateTotalScore()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Percentual de acertos:</span>
                <span className="ml-2 font-medium">
                  {formData.questoesTotais > 0 ? 
                    Math.round(((formData.linguagens + formData.humanas + formData.natureza + formData.matematica) / formData.questoesTotais) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {simulado ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
