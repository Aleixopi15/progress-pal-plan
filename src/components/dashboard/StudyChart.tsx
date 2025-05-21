
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export interface StudyChartProps {
  data: {
    name: string;
    hours: number;
    goal?: number;
  }[];
  className?: string;
  showGoal?: boolean;
}

export function StudyChart({ data, className, showGoal = true }: StudyChartProps) {
  return (
    <div className={`h-[240px] w-full ${className || ''}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Estudado
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0].value}h
                        </span>
                      </div>
                      {showGoal && payload[1] && (
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Meta
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[1].value}h
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="hours" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            name="Horas estudadas"
          />
          {showGoal && (
            <Bar 
              dataKey="goal" 
              fill="hsl(var(--muted))" 
              radius={[4, 4, 0, 0]}
              name="Meta diária" 
            />
          )}
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
