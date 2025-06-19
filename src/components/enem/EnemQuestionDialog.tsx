
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface EnemQuestion {
  id: number;
  year: number;
  number: number;
  discipline: string;
  subject: string;
  context: string;
  question: string;
  alternatives: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  answer: string;
  correctAlternative: string;
}

interface EnemQuestionDialogProps {
  question: EnemQuestion | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnemQuestionDialog({ question, open, onOpenChange }: EnemQuestionDialogProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const handleAnswerSelect = (alternative: string) => {
    if (showResult) return;
    setSelectedAnswer(alternative);
  };

  const handleSubmitAnswer = () => {
    setShowResult(true);
  };

  const handleClose = () => {
    setSelectedAnswer("");
    setShowResult(false);
    onOpenChange(false);
  };

  const resetQuestion = () => {
    setSelectedAnswer("");
    setShowResult(false);
  };

  if (!question) return null;

  const alternatives = Object.entries(question.alternatives);
  const isCorrect = selectedAnswer === question.correctAlternative;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>Enem {question.year} - Questão {question.number}</span>
            <Badge variant="secondary">{question.discipline}</Badge>
            {question.subject && (
              <Badge variant="outline">{question.subject}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context */}
          {question.context && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {question.context}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Question */}
          <div>
            <h3 className="font-medium mb-2">Questão:</h3>
            <p className="whitespace-pre-wrap">{question.question}</p>
          </div>

          {/* Alternatives */}
          <div className="space-y-2">
            <h3 className="font-medium">Alternativas:</h3>
            {alternatives.map(([letter, text]) => (
              <Card
                key={letter}
                className={`cursor-pointer transition-all ${
                  selectedAnswer === letter
                    ? showResult
                      ? letter === question.correctAlternative
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                      : "border-primary bg-primary/5"
                    : showResult && letter === question.correctAlternative
                    ? "border-green-500 bg-green-50"
                    : "hover:bg-muted/50"
                } ${showResult ? "cursor-default" : ""}`}
                onClick={() => handleAnswerSelect(letter)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm bg-muted px-2 py-1 rounded">
                        {letter}
                      </span>
                      {showResult && letter === question.correctAlternative && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {showResult && selectedAnswer === letter && letter !== question.correctAlternative && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm flex-1 whitespace-pre-wrap">{text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Result */}
          {showResult && (
            <Card className={isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <p className="font-medium">
                    {isCorrect ? "Parabéns! Resposta correta!" : "Resposta incorreta."}
                  </p>
                </div>
                <p className="text-sm mt-2">
                  A resposta correta é a alternativa <strong>{question.correctAlternative}</strong>: {question.answer}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {!showResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="flex-1"
              >
                Confirmar Resposta
              </Button>
            ) : (
              <Button onClick={resetQuestion} variant="outline" className="flex-1">
                Tentar Novamente
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
