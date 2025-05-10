
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  subject: string;
  time: string;
  duration: string;
  status: "completed" | "upcoming" | "missed";
}

interface StudyTasksProps {
  tasks: Task[];
  onComplete?: (id: string) => void;
}

export function StudyTasks({ tasks, onComplete }: StudyTasksProps) {
  const getTaskIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "upcoming":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case "missed":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Tarefas de Hoje</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "flex items-center justify-between rounded-lg border p-4",
              task.status === "completed" && "bg-muted/40",
              task.status === "missed" && "border-destructive/30"
            )}
          >
            <div className="flex items-center gap-3">
              {getTaskIcon(task.status)}
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <div className="flex flex-col sm:flex-row sm:gap-2 text-sm text-muted-foreground">
                  <span>{task.subject}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{task.time}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{task.duration}</span>
                </div>
              </div>
            </div>
            {task.status === "upcoming" && onComplete && (
              <button
                onClick={() => onComplete(task.id)}
                className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
              >
                Concluir
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
