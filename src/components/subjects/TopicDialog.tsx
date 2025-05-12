
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Topic } from "@/pages/Topics";

interface TopicDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  topic: Topic | null;
  subjectId: string;
  onSuccess: () => void;
}

export function TopicDialog({ open, setOpen, topic, subjectId, onSuccess }: TopicDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [topic, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para realizar esta ação."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (topic) {
        // Atualizar tópico existente
        const { error } = await supabase
          .from("topics")
          .update({
            name,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", topic.id);

        if (error) throw error;
        
        toast({
          title: "Tópico atualizado",
          description: "O tópico foi atualizado com sucesso!"
        });
      } else {
        // Criar novo tópico
        const { error } = await supabase
          .from("topics")
          .insert({
            name,
            description,
            subject_id: subjectId,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast({
          title: "Tópico criado",
          description: "O tópico foi criado com sucesso!"
        });
      }
      
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar tópico",
        description: error.message || "Ocorreu um erro ao salvar o tópico."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{topic ? "Editar Tópico" : "Novo Tópico"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Tópico</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Equações do 2º grau"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo do tópico"
              rows={4}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : topic ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
