
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Question } from "@/pages/Notes";
import { Check, X } from "lucide-react";

interface QuestionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  question: Question | null;
  topicId: string;
  onSuccess: () => void;
}

export function QuestionDialog({ open, setOpen, question, topicId, onSuccess }: QuestionDialogProps) {
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (question) {
      setContent(question.content);
      setAnswer(question.answer);
      setIsCorrect(question.is_correct);
    } else {
      setContent("");
      setAnswer("");
      setIsCorrect(false);
    }
  }, [question, open]);

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
    
    if (!content.trim() || !answer.trim()) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar questão",
        description: "A pergunta e a resposta não podem estar vazias."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (question) {
        // Atualizar questão existente
        const { error } = await supabase
          .from("questions")
          .update({
            content,
            answer,
            is_correct: isCorrect,
            updated_at: new Date().toISOString(),
          })
          .eq("id", question.id);

        if (error) throw error;
        
        toast({
          title: "Questão atualizada",
          description: "Sua questão foi atualizada com sucesso!"
        });
      } else {
        // Criar nova questão
        const { error } = await supabase
          .from("questions")
          .insert({
            content,
            answer,
            is_correct: isCorrect,
            topic_id: topicId,
            user_id: user.id,
          });

        if (error) throw error;
        
        toast({
          title: "Questão criada",
          description: "Sua questão foi salva com sucesso!"
        });
      }
      
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar questão",
        description: error.message || "Ocorreu um erro ao salvar a questão."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{question ? "Editar Questão" : "Nova Questão"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="content">Pergunta</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite a pergunta..."
              rows={5}
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="answer">Resposta</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite a resposta..."
              rows={5}
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Status da Questão</Label>
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant={isCorrect ? "default" : "outline"}
                className={isCorrect ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => setIsCorrect(true)}
              >
                <Check className="mr-2" size={18} />
                Acertei
              </Button>
              <Button
                type="button"
                variant={!isCorrect ? "default" : "outline"}
                className={!isCorrect ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={() => setIsCorrect(false)}
              >
                <X className="mr-2" size={18} />
                Errei
              </Button>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : question ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
