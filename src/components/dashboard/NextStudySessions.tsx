
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

interface StudySession {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
}

interface NextStudySessionsProps {
  sessions: StudySession[];
}

export function NextStudySessions({ sessions }: NextStudySessionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Próximas Sessões</CardTitle>
          <CardDescription>Sessões de estudo programadas</CardDescription>
        </div>
        <CalendarCheck className="text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <div className="flex justify-between">
              <h3 className="font-medium">{session.title}</h3>
              <span className="text-sm text-muted-foreground">{session.date}</span>
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:gap-2 text-sm text-muted-foreground">
              <span>{session.subject}</span>
              <span className="hidden sm:inline">•</span>
              <span>{session.time}</span>
              <span className="hidden sm:inline">•</span>
              <span>{session.duration}</span>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">
          Ver Todas as Sessões
        </Button>
      </CardFooter>
    </Card>
  );
}
