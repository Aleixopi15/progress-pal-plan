
import { cn } from "@/lib/utils";

interface SubjectProgressProps {
  subjects: {
    name: string;
    progress: number;
    color?: string;
  }[];
}

export function SubjectProgress({ subjects }: SubjectProgressProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Progresso por Matéria</h2>
      <div className="space-y-4">
        {subjects.map((subject) => (
          <div key={subject.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{subject.name}</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(subject.progress)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "h-2 rounded-full",
                  subject.color ? subject.color : "bg-primary"
                )}
                style={{ width: `${subject.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
