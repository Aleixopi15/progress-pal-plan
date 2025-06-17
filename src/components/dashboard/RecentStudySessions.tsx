
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Eye } from "lucide-react";
import { formatMinutesToHoursAndMinutes } from "@/lib/formatters";

interface RecentSession {
  id: string;
  title: string;
  subject: string;
  time: string;
  duration: string;
  status: "completed";
}

export interface RecentStudySessionsProps {
  sessions: RecentSession[];
  onViewDetails: (sessionId: string) => void;
}

export function RecentStudySessions({ sessions, onViewDetails }: RecentStudySessionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Últimas sessões de estudo</CardTitle>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>{session.subject}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{session.duration}</span>
                    <span>•</span>
                    <span>{session.time}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(session.id)}
                  className="gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Detalhes
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
