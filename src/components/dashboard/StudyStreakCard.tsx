
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_study_date: string | null;
}

interface DayStreak {
  date: string;
  hasStudied: boolean;
  isToday: boolean;
}

// Função para obter a data local no formato correto
const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para obter o dia da semana correto considerando fuso horário local
const getLocalDayOfWeek = (date = new Date()) => {
  return date.getDay();
};

export function StudyStreakCard() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
    last_study_date: null
  });
  const [weekDays, setWeekDays] = useState<DayStreak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados da sequência
      const { data: streakInfo } = await supabase
        .from('study_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (streakInfo) {
        setStreakData({
          current_streak: streakInfo.current_streak,
          longest_streak: streakInfo.longest_streak,
          last_study_date: streakInfo.last_study_date
        });
      }

      // Buscar sessões de estudo dos últimos 7 dias usando data local
      const today = new Date();
      const last7Days = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        last7Days.push(getLocalDateString(date));
      }

      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('date')
        .eq('user_id', user?.id)
        .in('date', last7Days);

      const studiedDates = new Set(studySessions?.map(session => session.date) || []);
      
      const weekData = last7Days.map((dateStr, index) => {
        const date = new Date(dateStr + 'T00:00:00'); // Força UTC para evitar problemas de fuso
        const dayOfWeek = getLocalDayOfWeek(date);
        const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const todayStr = getLocalDateString(today);
        
        return {
          date: dayLabels[dayOfWeek],
          hasStudied: studiedDates.has(dateStr),
          isToday: dateStr === todayStr
        };
      });

      setWeekDays(weekData);
    } catch (error) {
      console.error("Error fetching streak data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="flex justify-between">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="h-8 w-8 bg-muted rounded-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Flame className="h-5 w-5" />
          Sequência de Estudos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {streakData.current_streak}
              </span>
              <Flame className="h-6 w-6 text-orange-500 dark:text-orange-400" />
            </div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Dias seguidos</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                {streakData.longest_streak}
              </span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">Recorde</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Últimos 7 dias</span>
          </div>
          
          <div className="flex justify-between gap-1">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center flex-1">
                <div
                  className={cn(
                    "h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all",
                    day.hasStudied 
                      ? "bg-orange-500 dark:bg-orange-600 text-white border-orange-500 dark:border-orange-600" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700",
                    day.isToday && "ring-2 ring-orange-300 dark:ring-orange-400 ring-offset-2 dark:ring-offset-gray-900"
                  )}
                >
                  {day.hasStudied ? (
                    <Flame className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current opacity-50" />
                  )}
                </div>
                <p className="text-xs mt-1 text-muted-foreground">{day.date}</p>
              </div>
            ))}
          </div>
        </div>

        {streakData.current_streak >= 7 && (
          <div className="text-center">
            <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700">
              🔥 Em chamas! Continue assim!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
