
import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddStudyTimeDialog } from "./AddStudyTimeDialog";

export function StudyTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
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
  };

  const timeInMinutes = Math.floor(time / 60);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
        <Clock size={16} className="text-muted-foreground" />
        <span className="font-mono text-sm font-medium">
          {formatTime(time)}
        </span>
      </div>
      
      <div className="flex gap-1">
        {!isRunning ? (
          <Button onClick={handleStart} size="sm" variant="outline">
            <Play size={14} />
          </Button>
        ) : (
          <Button onClick={handlePause} size="sm" variant="outline">
            <Pause size={14} />
          </Button>
        )}
        
        <Button onClick={handleStop} size="sm" variant="outline">
          <Square size={14} />
        </Button>
      </div>

      <AddStudyTimeDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onStudyTimeAdded={handleSave}
        defaultTime={timeInMinutes}
      />
    </div>
  );
}
