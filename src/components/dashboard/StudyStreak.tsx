
import { cn } from "@/lib/utils";

interface StudyStreakProps {
  currentStreak: number;
  days: {
    date: string;
    hasStudied: boolean;
  }[];
}

export function StudyStreak({ currentStreak, days }: StudyStreakProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Sequência de Estudos</h3>
        <span className="text-sm text-muted-foreground">
          {currentStreak} dias consecutivos
        </span>
      </div>
      <div className="flex justify-between gap-1">
        {days.map((day, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className={cn(
                "h-2.5 w-full rounded-full",
                day.hasStudied ? "bg-primary" : "bg-muted"
              )}
            />
            <span className="text-xs text-muted-foreground">{day.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
