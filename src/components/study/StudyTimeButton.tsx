
import React, { useState } from "react";
import { Clock, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudyTimeDialog } from "./AddStudyTimeDialog";
import { FloatingTimer } from "./FloatingTimer";

interface StudyTimeButtonProps {
  onStudyTimeAdded?: () => void;
}

export function StudyTimeButton({ onStudyTimeAdded }: StudyTimeButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);

  const handleStudyTimeAdded = () => {
    if (onStudyTimeAdded) {
      onStudyTimeAdded();
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button 
          onClick={() => setIsTimerOpen(true)}
          size="sm"
          className="gap-2"
          variant="outline"
        >
          <Timer size={18} />
          <span className="hidden sm:inline">Cronômetro</span>
        </Button>
        
        <Button 
          onClick={() => setIsDialogOpen(true)}
          size="sm"
          className="gap-2"
        >
          <Clock size={18} />
          <span className="hidden sm:inline">Registrar Tempo</span>
          <span className="sm:hidden">Registrar</span>
        </Button>
      </div>
      
      <FloatingTimer 
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        onStudyTimeAdded={handleStudyTimeAdded}
      />
      
      <AddStudyTimeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onStudyTimeAdded={handleStudyTimeAdded}
      />
    </>
  );
}
