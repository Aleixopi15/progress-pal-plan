
import React from "react";
import { PageTitle } from "@/components/layout/PageTitle";
import { WeeklySchedule } from "@/components/calendar/WeeklySchedule";

export default function Calendar() {
  return (
    <div className="animate-fade-in">
      <PageTitle 
        title="Cronograma Semanal" 
        subtitle="Organize sua rotina de estudos semanal"
      />
      
      <div className="mt-6">
        <WeeklySchedule />
      </div>
    </div>
  );
}
