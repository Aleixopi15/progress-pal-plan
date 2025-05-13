
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, Timer, TimerReset } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDuration } from "@/lib/formatters";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddStudyTimeDialog } from "./AddStudyTimeDialog";

export function StudyTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showStudyDialog, setShowStudyDialog] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Start or pause timer
  const toggleTimer = () => {
    if (isRunning) {
      // Pause
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
      
      // Show toast when pausing
      if (seconds > 60) { // Only show if timer has been running for at least a minute
        toast({
          title: "Cronômetro pausado",
          description: `Tempo decorrido: ${formatDuration(seconds)}`,
        });
      }
    } else {
      // Start
      setIsRunning(true);
      intervalRef.current = window.setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }
  };
  
  // Reset the timer
  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only show completion dialog if timer was actually used
    if (seconds > 60) {
      setIsRunning(false);
      setShowStudyDialog(true);
    } else {
      setSeconds(0);
      setIsRunning(false);
    }
  };
  
  // Handle post-reset actions when dialog is closed
  const handleDialogClose = (saved: boolean) => {
    setShowStudyDialog(false);
    setSeconds(0);
    
    if (saved) {
      toast({
        title: "Tempo de estudo registrado",
        description: `${formatDuration(seconds)} foram registrados com sucesso!`,
      });
    }
  };
  
  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Timer className="h-4 w-4" />
            <span>Cronômetro</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Cronômetro de Estudo</SheetTitle>
            <SheetDescription>
              Registre seu tempo de estudo com este cronômetro e salve seus resultados.
            </SheetDescription>
          </SheetHeader>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-center">Tempo de Estudo</CardTitle>
              <CardDescription className="text-center">Clique em iniciar para começar a cronometrar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="text-5xl font-bold tabular-nums">
                  {formatDuration(seconds)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button 
                variant={isRunning ? "outline" : "default"}
                onClick={toggleTimer}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Iniciar
                  </>
                )}
              </Button>
              
              <Button 
                variant="destructive" 
                onClick={resetTimer}
                disabled={seconds === 0}
                className="gap-2"
              >
                <TimerReset className="h-4 w-4" />
                Finalizar
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium">Dicas para estudos eficientes:</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-primary" />
                <span>A técnica Pomodoro sugere estudar por 25 minutos e descansar por 5.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-primary" />
                <span>Faça pausas mais longas (15-30 min) a cada 2 horas de estudo.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-primary" />
                <span>Registre seu tempo de estudo para acompanhar seu progresso.</span>
              </li>
            </ul>
          </div>
        </SheetContent>
      </Sheet>
      
      <AddStudyTimeDialog
        open={showStudyDialog}
        onOpenChange={(open) => {
          if (!open) handleDialogClose(false);
        }}
        initialStudyTime={Math.ceil(seconds / 60).toString()}
        onSave={() => handleDialogClose(true)}
      />
    </>
  );
}
