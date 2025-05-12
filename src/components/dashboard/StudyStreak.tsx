
import { cn } from "@/lib/utils";

export interface StudyStreakProps {
  currentStreak: number;
  days: {
    date: string;
    hasStudied: boolean;
  }[];
}

export function StudyStreak({ currentStreak, days }: StudyStreakProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">Sequência atual</p>
        <h2 className="text-4xl font-bold">{currentStreak} dias</h2>
      </div>

      <div className="flex justify-between">
        {days.map((day, i) => (
          <div key={i} className="text-center">
            <div
              className={cn(
                "h-4 w-4 mx-auto rounded-full mb-1",
                day.hasStudied ? "bg-primary" : "bg-muted"
              )}
            />
            <p className="text-xs">{day.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
