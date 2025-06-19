
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export interface NextStudySessionsProps {
  sessions: {
    id: string;
    title: string;
    subject: string;
    date: string;
    time: string;
    duration: string;
  }[];
  onViewDetails?: (sessionId: string) => void;
}

export function NextStudySessions({ sessions, onViewDetails }: NextStudySessionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Sessões de Estudo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma sessão registrada. Comece a estudar para ver suas sessões aqui!
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.subject} • {session.date} • {session.time} • {session.duration}
                  </p>
                </div>
                {onViewDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(session.id)}
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Detalhes
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
