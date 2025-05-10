
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <h3 className="text-2xl font-semibold">{value}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p
            className={cn(
              "text-xs font-medium mt-1",
              trend.isPositive ? "text-secondary" : "text-destructive"
            )}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%{" "}
            <span className="text-muted-foreground">em relação à semana passada</span>
          </p>
        )}
      </div>
    </div>
  );
}
