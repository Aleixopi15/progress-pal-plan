
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Clock, CheckCircle, Calendar, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description?: string;
  type: "subject" | "time" | "task";
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  subject_id?: string;
  priority: "high" | "medium" | "low";
  is_completed: boolean;
  subject_name?: string;
}

interface GoalCardProps {
  goal: Goal;
  onUpdateProgress: (goalId: string, value: number) => void;
  onDelete: (goalId: string) => void;
}

export function GoalCard({ goal, onUpdateProgress, onDelete }: GoalCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "subject":
        return <Target className="h-4 w-4" />;
      case "time":
        return <Clock className="h-4 w-4" />;
      case "task":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "subject":
        return "Matéria";
      case "time":
        return "Tempo";
      case "task":
        return "Tarefa";
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !goal.is_completed;

  return (
    <Card className={cn(
      "relative transition-all hover:shadow-md",
      goal.is_completed && "bg-green-50 border-green-200",
      isOverdue && "bg-red-50 border-red-200"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", getPriorityColor(goal.priority))}>
              {getTypeIcon(goal.type)}
            </div>
            <div>
              <CardTitle className="text-base">{goal.title}</CardTitle>
              {goal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {goal.description}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(goal.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {getTypeLabel(goal.type)}
          </Badge>
          <Badge variant="outline" className={cn("text-xs", getPriorityColor(goal.priority))}>
            {getPriorityLabel(goal.priority)}
          </Badge>
          {goal.subject_name && (
            <Badge variant="outline" className="text-xs">
              {goal.subject_name}
            </Badge>
          )}
          {goal.deadline && (
            <Badge variant="outline" className={cn(
              "text-xs flex items-center gap-1",
              isOverdue && "text-red-600 bg-red-50"
            )}>
              <Calendar className="h-3 w-3" />
              {new Date(goal.deadline).toLocaleDateString("pt-BR")}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso: {goal.current_value} de {goal.target_value} {goal.unit}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {!goal.is_completed && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateProgress(goal.id, goal.current_value + 1)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Incrementar
            </Button>
          </div>
        )}

        {goal.is_completed && (
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">
              ✅ Meta concluída!
            </Badge>
          </div>
        )}

        {isOverdue && (
          <div className="text-center">
            <Badge variant="destructive">
              ⚠️ Prazo vencido
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
