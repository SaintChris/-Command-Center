import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({ title, value, change, trend, icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn("glass-panel tech-border overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono tracking-tight text-foreground">{value}</div>
        {change && (
          <p className={cn(
            "text-xs flex items-center mt-1 font-mono",
            trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
          )}>
            {change}
            {trend === "up" && " ▲"}
            {trend === "down" && " ▼"}
          </p>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/10">
           <div className="h-full bg-primary/50 w-[60%]" /> {/* Mock progress bar decoration */}
        </div>
      </CardContent>
    </Card>
  );
}