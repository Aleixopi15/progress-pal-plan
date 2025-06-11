
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, BookOpen, Calendar, Target, PlayCircle, FileText, MessageSquare } from "lucide-react";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";

interface Session {
  id: string;
  date: string;
  registration_time: string;
  subject_id: string;
  topic_id: string | null;
  subtopic: string | null;
  study_time: number;
  lesson: string | null;
  start_page: number | null;
  end_page: number | null;
  correct_exercises: number | null;
  incorrect_exercises: number | null;
  video_start_time: string | null;
  video_end_time: string | null;
  comment: string | null;
  subject_name: string;
  topic_name: string | null;
}

interface SessionDetailDialogProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionDetailDialog({ session, open, onOpenChange }: SessionDetailDialogProps) {
  if (!session) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalExercises = (session.correct_exercises || 0) + (session.incorrect_exercises || 0);
  const successRate = totalExercises > 0 ? Math.round(((session.correct_exercises || 0) / totalExercises) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Detalhes da Sessão de Estudo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data:</span>
              <span>{formatDate(session.date)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Horário:</span>
              <span>{session.registration_time}</span>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Duração:</span>
              <Badge variant="secondary">{formatMinutesToHoursAndMinutes(session.study_time)}</Badge>
            </div>
          </div>

          <Separator />

          {/* Matéria e Tópico */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Conteúdo Estudado</h3>
            
            <div className="grid gap-3">
              <div>
                <span className="font-medium text-sm text-muted-foreground">Matéria:</span>
                <p className="font-medium">{session.subject_name}</p>
              </div>

              {session.topic_name && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Tópico:</span>
                  <p>{session.topic_name}</p>
                </div>
              )}

              {session.lesson && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Aula/Conteúdo:</span>
                  <p>{session.lesson}</p>
                </div>
              )}

              {session.subtopic && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Subtópico:</span>
                  <p>{session.subtopic}</p>
                </div>
              )}
            </div>
          </div>

          {/* Exercícios */}
          {totalExercises > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Exercícios</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{session.correct_exercises || 0}</div>
                    <div className="text-sm text-green-700">Acertos</div>
                  </div>
                  
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{session.incorrect_exercises || 0}</div>
                    <div className="text-sm text-red-700">Erros</div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{totalExercises}</div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{successRate}%</div>
                    <div className="text-sm text-purple-700">Acerto</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Páginas */}
          {(session.start_page || session.end_page) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Material de Estudo
                </h3>
                
                <div className="flex items-center gap-4">
                  {session.start_page && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Página inicial:</span>
                      <p className="font-medium">{session.start_page}</p>
                    </div>
                  )}
                  
                  {session.end_page && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Página final:</span>
                      <p className="font-medium">{session.end_page}</p>
                    </div>
                  )}
                  
                  {session.start_page && session.end_page && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Total de páginas:</span>
                      <Badge variant="outline">{session.end_page - session.start_page + 1}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Vídeo */}
          {(session.video_start_time || session.video_end_time) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Vídeo Assistido
                </h3>
                
                <div className="flex items-center gap-4">
                  {session.video_start_time && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Tempo inicial:</span>
                      <p className="font-medium">{session.video_start_time}</p>
                    </div>
                  )}
                  
                  {session.video_end_time && (
                    <div>
                      <span className="font-medium text-sm text-muted-foreground">Tempo final:</span>
                      <p className="font-medium">{session.video_end_time}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Comentários */}
          {session.comment && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comentários
                </h3>
                
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{session.comment}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
