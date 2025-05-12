
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Check, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface QuestionCreateDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  topicId: string;
  topicName: string;
  onSuccess: () => void;
}

export function QuestionCreateDialog({ 
  open, 
  setOpen, 
  topicId, 
  topicName, 
  onSuccess 
}: QuestionCreateDialogProps) {
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    setContent("");
    setAnswer("");
    setIsCorrect(null);
    setOpen(false);
  };

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
    
    if (!content.trim() || !answer.trim() || isCorrect === null) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos e selecione se a resposta está correta ou não."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
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
        title: "Questão adicionada",
        description: "A questão foi adicionada com sucesso!"
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar questão",
        description: error.message || "Ocorreu um erro ao adicionar a questão."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Questão - {topicName}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="content">Pergunta</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite a pergunta..."
              rows={4}
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
              rows={4}
              required
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Resultado</Label>
            <RadioGroup 
              value={isCorrect === null ? undefined : isCorrect ? "correct" : "incorrect"} 
              onValueChange={(value) => setIsCorrect(value === "correct")}
              className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="correct" id="correct" />
                <Label htmlFor="correct" className="flex items-center">
                  <Check className="mr-1 h-4 w-4 text-green-600" />
                  Acertei a questão
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incorrect" id="incorrect" />
                <Label htmlFor="incorrect" className="flex items-center">
                  <X className="mr-1 h-4 w-4 text-red-600" />
                  Errei a questão
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Adicionar Questão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
