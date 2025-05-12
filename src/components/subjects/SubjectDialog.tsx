
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Subject } from "@/pages/Subjects";

interface SubjectDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  subject: Subject | null;
  onSuccess: () => void;
}

export function SubjectDialog({ open, setOpen, subject, onSuccess }: SubjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (subject) {
      setName(subject.name);
      setDescription(subject.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [subject, open]);

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
      
      if (subject) {
        // Atualizar matéria existente
        const { error } = await supabase
          .from("subjects")
          .update({
            name,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq("id", subject.id);

        if (error) throw error;
        
        toast({
          title: "Matéria atualizada",
          description: "A matéria foi atualizada com sucesso!"
        });
      } else {
        // Criar nova matéria
        const { error } = await supabase
          .from("subjects")
          .insert({
            name,
            description,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast({
          title: "Matéria criada",
          description: "A matéria foi criada com sucesso!"
        });
      }
      
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar matéria",
        description: error.message || "Ocorreu um erro ao salvar a matéria."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{subject ? "Editar Matéria" : "Nova Matéria"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Matéria</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Matemática"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conteúdo da matéria"
              rows={4}
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : subject ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
