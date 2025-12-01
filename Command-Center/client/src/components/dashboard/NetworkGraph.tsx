import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchNetworkMetrics } from "@/lib/api";
import { format } from "date-fns";

export function NetworkGraph() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ["network-metrics"],
    queryFn: () => fetchNetworkMetrics(20),
    refetchInterval: 15000,
  });

  const chartData = metrics.map(m => ({
    time: format(new Date(m.timestamp), "HH:mm"),
    inbound: m.inbound,
    outbound: m.outbound,
  })).reverse();

  if (isLoading) {
    return (
      <Card className="glass-panel tech-border col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary">
            <Activity className="h-4 w-4" />
            Network Traffic (MB/s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading metrics...</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="glass-panel tech-border col-span-1 md:col-span-2 lg:col-span-2 min-h-[300px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary">
          <Activity className="h-4 w-4" />
          Network Traffic (MB/s)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No network data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              fontFamily="monospace"
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                borderColor: 'hsl(var(--border))',
                fontFamily: 'monospace'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area 
              type="monotone" 
              dataKey="inbound" 
              stroke="hsl(var(--primary))" 
              fillOpacity={1} 
              fill="url(#colorInbound)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="outbound" 
              stroke="hsl(var(--chart-2))" 
              fillOpacity={1} 
              fill="url(#colorOutbound)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}