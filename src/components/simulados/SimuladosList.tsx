
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar, Building, Target } from "lucide-react";
import { Simulado } from "@/pages/Simulados";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SimuladosListProps {
  simulados: Simulado[];
  onEdit: (simulado: Simulado) => void;
  onDelete: (id: string) => void;
}

export function SimuladosList({ simulados, onEdit, onDelete }: SimuladosListProps) {
  if (simulados.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum simulado cadastrado
        </h3>
        <p className="text-muted-foreground">
          Comece cadastrando seu primeiro simulado para acompanhar seu progresso.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getPercentageCorrect = (acertadas: number, totais: number) => {
    if (totais === 0) return 0;
    return Math.round((acertadas / totais) * 100);
  };

  return (
    <div className="grid gap-4">
      {simulados.map((simulado) => (
        <Card key={simulado.id} className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{simulado.nome}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(simulado.data)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    {simulado.instituicao}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(simulado)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir simulado</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir este simulado? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(simulado.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{simulado.notaTotal}</p>
                <p className="text-sm text-muted-foreground">Nota Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">
                  {getPercentageCorrect(simulado.questoesAcertadas, simulado.questoesTotais)}%
                </p>
                <p className="text-sm text-muted-foreground">Acertos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">
                  {simulado.questoesAcertadas}/{simulado.questoesTotais}
                </p>
                <p className="text-sm text-muted-foreground">Questões</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notas por Área:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Linguagens: {simulado.linguagens}</Badge>
                <Badge variant="outline">Humanas: {simulado.humanas}</Badge>
                <Badge variant="outline">Natureza: {simulado.natureza}</Badge>
                <Badge variant="outline">Matemática: {simulado.matematica}</Badge>
                <Badge variant="outline">Redação: {simulado.redacao}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
