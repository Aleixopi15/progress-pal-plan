
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface NextStudySessionsProps {
  sessions: {
    id: string;
    title: string;
    subject: string;
    date: string;
    time: string;
    duration: string;
  }[];
}

export function NextStudySessions({ sessions }: NextStudySessionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Próximas sessões de estudo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma sessão agendada. Planeje seu próximo estudo!
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <h3 className="font-medium">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.subject} • {session.date} • {session.time} • {session.duration}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
