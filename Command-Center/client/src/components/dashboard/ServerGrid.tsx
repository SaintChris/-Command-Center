import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server as ServerIcon, Circle, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchServers } from "@/lib/api";
import type { Server } from "@shared/schema";

export function ServerGrid() {
  const { data: servers = [], isLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: fetchServers,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <Card className="glass-panel tech-border col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary">
            <Cloud className="h-4 w-4" />
            Global Infrastructure Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading servers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel tech-border col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary">
          <Cloud className="h-4 w-4" />
          Global Infrastructure Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {servers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No servers configured yet</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {servers.map((server: Server) => (
                <div 
                  key={server.id} 
                  data-testid={`server-card-${server.id}`}
                  className={cn(
                    "p-3 rounded bg-card/50 border transition-all duration-300 hover:bg-card/80 group cursor-pointer",
                    server.status === "healthy" && "border-success/20",
                    server.status === "warning" && "border-warning/20",
                    server.status === "critical" && "border-destructive/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse",
                    server.status === "maintenance" && "border-muted/20 opacity-70"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{server.region}</span>
                    <Circle className={cn(
                      "h-2 w-2 fill-current",
                      server.status === "healthy" && "text-success",
                      server.status === "warning" && "text-warning",
                      server.status === "critical" && "text-destructive",
                      server.status === "maintenance" && "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex items-center gap-2">
                    <ServerIcon className="h-5 w-5 text-primary/80 group-hover:text-primary transition-colors" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold font-mono" data-testid={`server-id-${server.id}`}>{server.serverId}</span>
                      <span className="text-[10px] text-muted-foreground font-mono" data-testid={`server-load-${server.id}`}>LOAD: {server.load}%</span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-secondary mt-3 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", 
                        server.load > 90 ? "bg-destructive" : server.load > 70 ? "bg-warning" : "bg-success"
                      )} 
                      style={{ width: `${server.load}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}