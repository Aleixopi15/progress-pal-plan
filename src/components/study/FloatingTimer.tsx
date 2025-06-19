
import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Clock, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AddStudyTimeDialog } from "./AddStudyTimeDialog";

interface FloatingTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onStudyTimeAdded?: () => void;
}

export function FloatingTimer({ isOpen, onClose, onStudyTimeAdded }: FloatingTimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  
  const handleStop = () => {
    setIsRunning(false);
    if (time > 0) {
      setIsDialogOpen(true);
    }
  };

  const handleSave = () => {
    setTime(0);
    setIsDialogOpen(false);
    if (onStudyTimeAdded) {
      onStudyTimeAdded();
    }
  };

  const timeInMinutes = Math.floor(time / 60);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="font-semibold text-sm">Cronômetro de Estudo</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  <Minimize2 size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="pt-2">
              <div className="text-center space-y-4">
                <div className="text-2xl font-mono font-bold text-primary">
                  {formatTime(time)}
                </div>
                
                <div className="flex justify-center gap-2">
                  {!isRunning ? (
                    <Button onClick={handleStart} size="sm">
                      <Play size={14} className="mr-1" />
                      Iniciar
                    </Button>
                  ) : (
                    <Button onClick={handlePause} size="sm" variant="outline">
                      <Pause size={14} className="mr-1" />
                      Pausar
                    </Button>
                  )}
                  
                  <Button onClick={handleStop} size="sm" variant="outline">
                    <Square size={14} className="mr-1" />
                    Parar
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
          
          {isMinimized && (
            <CardContent className="py-2">
              <div className="text-center">
                <span className="font-mono text-sm font-bold text-primary">
                  {formatTime(time)}
                </span>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <AddStudyTimeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onStudyTimeAdded={handleSave}
        defaultTime={timeInMinutes}
      />
    </>
  );
}
