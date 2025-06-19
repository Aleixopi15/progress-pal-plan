
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { EnemQuestionDialog } from "./EnemQuestionDialog";

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

interface EnemQuestionsListProps {
  questions: EnemQuestion[];
  isLoading: boolean;
  error: any;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EnemQuestionsList({ 
  questions, 
  isLoading, 
  error, 
  currentPage, 
  totalPages, 
  onPageChange 
}: EnemQuestionsListProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<EnemQuestion | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewQuestion = (question: EnemQuestion) => {
    setSelectedQuestion(question);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Erro ao carregar questões: {error.message}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma questão encontrada com os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{question.year}</Badge>
                    <Badge variant="outline">{question.discipline}</Badge>
                    {question.subject && (
                      <Badge variant="outline">{question.subject}</Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Questão {question.number}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {question.context && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {question.context}
                      </p>
                    )}
                    <p className="text-sm line-clamp-3">
                      {question.question}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewQuestion(question)}
                  className="shrink-0"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver questão
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <span className="px-4 py-2 text-sm">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <EnemQuestionDialog
        question={selectedQuestion}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
