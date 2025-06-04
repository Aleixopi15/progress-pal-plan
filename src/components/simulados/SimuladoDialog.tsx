
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Simulado } from "@/pages/Simulados";

interface SimuladoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (simulado: Omit<Simulado, "id">) => void;
  simulado?: Simulado | null;
}

const instituicoes = [
  "ENEM",
  "Fuvest",
  "Unicamp",
  "UFRJ",
  "UFMG",
  "UnB",
  "UERJ",
  "Mackenzie",
  "PUC-SP",
  "Outro",
];

export function SimuladoDialog({ open, onClose, onSubmit, simulado }: SimuladoDialogProps) {
  const form = useForm({
    defaultValues: {
      nome: "",
      data: "",
      instituicao: "",
      linguagens: 0,
      humanas: 0,
      natureza: 0,
      matematica: 0,
      redacao: 0,
      questoesTotais: 0,
      questoesAcertadas: 0,
    },
  });

  useEffect(() => {
    if (simulado) {
      form.reset({
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
    } else {
      form.reset({
        nome: "",
        data: "",
        instituicao: "",
        linguagens: 0,
        humanas: 0,
        natureza: 0,
        matematica: 0,
        redacao: 0,
        questoesTotais: 0,
        questoesAcertadas: 0,
      });
    }
  }, [simulado, form]);

  const handleSubmit = (data: any) => {
    const notaTotal = data.linguagens + data.humanas + data.natureza + data.matematica + data.redacao;
    
    onSubmit({
      ...data,
      notaTotal,
    });
    
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {simulado ? "Editar Simulado" : "Novo Simulado"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Simulado</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Simulado ENEM 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Realização</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instituicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instituição/Plataforma</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a instituição" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instituicoes.map((inst) => (
                        <SelectItem key={inst} value={inst}>
                          {inst}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notas por Área de Conhecimento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linguagens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linguagens</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="humanas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciências Humanas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="natureza"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciências da Natureza</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matematica"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matemática</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redação</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Questões</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questoesTotais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Questões Totais</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questoesAcertadas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Questões Acertadas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {simulado ? "Atualizar" : "Cadastrar"} Simulado
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
