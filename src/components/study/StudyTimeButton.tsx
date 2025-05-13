
import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudyTimeDialog } from "./AddStudyTimeDialog";

export function StudyTimeButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        size="lg"
        className="gap-2"
      >
        <Clock size={18} />
        Registrar Tempo de Estudo
      </Button>
      
      <AddStudyTimeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
