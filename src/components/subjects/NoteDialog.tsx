
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Note } from "@/pages/Notes";

interface NoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  note: Note | null;
  topicId: string;
  onSuccess: () => void;
}

export function NoteDialog({ open, setOpen, note, topicId, onSuccess }: NoteDialogProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (note) {
      setContent(note.content);
    } else {
      setContent("");
    }
  }, [note, open]);

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
    
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar anotação",
        description: "A anotação não pode estar vazia."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (note) {
        // Atualizar anotação existente
        const { error } = await supabase
          .from("notes")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", note.id);

        if (error) throw error;
        
        toast({
          title: "Anotação atualizada",
          description: "Sua anotação foi atualizada com sucesso!"
        });
      } else {
        // Criar nova anotação
        const { error } = await supabase
          .from("notes")
          .insert({
            content,
            topic_id: topicId,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast({
          title: "Anotação criada",
          description: "Sua anotação foi salva com sucesso!"
        });
      }
      
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar anotação",
        description: error.message || "Ocorreu um erro ao salvar a anotação."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{note ? "Editar Anotação" : "Nova Anotação"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo da Anotação</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite sua anotação aqui..."
              rows={10}
              required
              className="min-h-[200px]"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : note ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
