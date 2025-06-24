
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface Subject {
  id: string;
  name: string;
}

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
}

export function CreateGoalDialog({ open, onOpenChange, onGoalCreated }: CreateGoalDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    type: "subject" as "subject" | "time" | "task",
    target_value: 0,
    unit: "",
    deadline: undefined as Date | undefined,
    subject_id: "",
    priority: "medium" as "high" | "medium" | "low"
  });

  useEffect(() => {
    if (open && user) {
      fetchSubjects();
    }
  }, [open, user]);

  const fetchSubjects = async () => {
    try {
      const { data } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');
      
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleTypeChange = (type: "subject" | "time" | "task") => {
    setGoalData(prev => ({
      ...prev,
      type,
      unit: type === "time" ? "horas" : type === "task" ? "questões" : "%"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goalData.title.trim() || goalData.target_value <= 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user?.id,
          title: goalData.title,
          description: goalData.description || null,
          type: goalData.type,
          target_value: goalData.target_value,
          unit: goalData.unit,
          deadline: goalData.deadline ? goalData.deadline.toISOString().split('T')[0] : null,
          subject_id: goalData.subject_id || null,
          priority: goalData.priority
        });

      if (error) throw error;

      toast({
        title: "Meta criada!",
        description: "Sua nova meta foi criada com sucesso."
      });

      onGoalCreated();
      onOpenChange(false);
      
      // Reset form
      setGoalData({
        title: "",
        description: "",
        type: "subject",
        target_value: 0,
        unit: "%",
        deadline: undefined,
        subject_id: "",
        priority: "medium"
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a meta"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Meta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={goalData.title}
              onChange={(e) => setGoalData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Completar módulo de matemática"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={goalData.description}
              onChange={(e) => setGoalData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição opcional da meta"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select onValueChange={handleTypeChange} value={goalData.type}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="subject">Progresso em Matéria</SelectItem>
                  <SelectItem value="time">Tempo de Estudo</SelectItem>
                  <SelectItem value="task">Conclusão de Tarefas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select onValueChange={(value: "high" | "medium" | "low") => 
                setGoalData(prev => ({ ...prev, priority: value }))} 
                value={goalData.priority}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {goalData.type === "subject" && subjects.length > 0 && (
            <div className="space-y-2">
              <Label>Matéria</Label>
              <Select onValueChange={(value) => setGoalData(prev => ({ ...prev, subject_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma matéria" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Meta *</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={goalData.target_value || ""}
                onChange={(e) => setGoalData(prev => ({ ...prev, target_value: parseInt(e.target.value) || 0 }))}
                placeholder="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Input
                id="unit"
                value={goalData.unit}
                onChange={(e) => setGoalData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="Ex: %, horas, questões"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !goalData.deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {goalData.deadline ? format(goalData.deadline, "dd/MM/yyyy") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={goalData.deadline}
                  onSelect={(date) => setGoalData(prev => ({ ...prev, deadline: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
