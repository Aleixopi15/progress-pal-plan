
import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudyTimeDialog } from "./AddStudyTimeDialog";
import { StudyTimer } from "./StudyTimer";

export function StudyTimeButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex gap-2">
      <StudyTimer />
      
      <Button 
        onClick={() => setIsDialogOpen(true)}
        size="sm"
        className="gap-2"
      >
        <Clock size={18} />
        <span className="hidden sm:inline">Registrar Tempo</span>
        <span className="sm:hidden">Registrar</span>
      </Button>
      
      <AddStudyTimeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
