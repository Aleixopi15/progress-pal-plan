
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StudyTasksProps {
  tasks: {
    id: string;
    title: string;
    subject: string;
    time: string;
    duration: string;
    status: "upcoming" | "completed" | "missed";
  }[];
  onComplete?: (id: string) => void;
}

export function StudyTasks({ tasks, onComplete }: StudyTasksProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Tarefas de Estudo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Nenhuma tarefa para hoje. Aproveite seu dia!
            </p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border p-3",
                  task.status === "completed" && "border-green-200 bg-green-50",
                  task.status === "missed" && "border-red-200 bg-red-50"
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {task.status === "completed" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : task.status === "missed" ? (
                      <X className="h-4 w-4 text-red-500" />
                    ) : null}
                    <h3 className="font-medium">{task.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.subject} • {task.time} • {task.duration}
                  </p>
                </div>
                {task.status === "upcoming" && onComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete(task.id)}
                  >
                    Concluir
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
