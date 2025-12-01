import { Server, Ticket, NetworkMetric, SystemMetric } from "@shared/schema";

export async function fetchServers(): Promise<Server[]> {
  const response = await fetch("/api/servers");
  if (!response.ok) throw new Error("Failed to fetch servers");
  return response.json();
}

export async function fetchTickets(): Promise<Ticket[]> {
  const response = await fetch("/api/tickets");
  if (!response.ok) throw new Error("Failed to fetch tickets");
  return response.json();
}

export async function fetchNetworkMetrics(limit: number = 20): Promise<NetworkMetric[]> {
  const response = await fetch(`/api/network-metrics?limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch network metrics");
  return response.json();
}

export async function fetchLatestSystemMetric(): Promise<SystemMetric | null> {
  const response = await fetch("/api/system-metrics/latest");
  if (!response.ok) throw new Error("Failed to fetch system metrics");
  return response.json();
}

export async function updateServerStatus(id: number, status: string, load: number): Promise<Server> {
  const response = await fetch(`/api/servers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, load }),
  });
  if (!response.ok) throw new Error("Failed to update server");
  return response.json();
}

export async function updateTicketStatus(id: number, status: string): Promise<Ticket> {
  const response = await fetch(`/api/tickets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update ticket");
  return response.json();
}