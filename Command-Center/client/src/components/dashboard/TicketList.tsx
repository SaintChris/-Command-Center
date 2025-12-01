import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle2, Clock, Ticket as TicketIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchTickets } from "@/lib/api";
import type { Ticket } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export function TicketList() {
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="glass-panel tech-border col-span-1 h-full min-h-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary">
            <TicketIcon className="h-4 w-4" />
            Help Desk Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading tickets...</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="glass-panel tech-border col-span-1 h-full min-h-[300px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider text-primary">
          <TicketIcon className="h-4 w-4" />
          Help Desk Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-6 pb-4">
          {tickets.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No tickets yet</div>
          ) : (
            <div className="space-y-4">
                {tickets.map((ticket: Ticket) => (
                  <div key={ticket.id} className="flex flex-col gap-2 pb-4 border-b border-border/50 last:border-0 last:pb-0 group" data-testid={`ticket-${ticket.id}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary group-hover:underline cursor-pointer" data-testid={`ticket-id-${ticket.id}`}>{ticket.ticketId}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-tight" data-testid={`ticket-subject-${ticket.id}`}>{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={
                          ticket.priority === "high" ? "border-destructive text-destructive" : 
                          ticket.priority === "medium" ? "border-warning text-warning" : 
                          "border-muted-foreground text-muted-foreground"
                        }
                        data-testid={`ticket-priority-${ticket.id}`}
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge 
                        variant={ticket.status === "resolved" ? "default" : "secondary"}
                        className="text-[10px] uppercase"
                        data-testid={`ticket-status-${ticket.id}`}
                      >
                        {ticket.status === "resolved" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}