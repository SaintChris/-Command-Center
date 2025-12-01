import { Server, Ticket, NetworkMetric, SystemMetric, User, Settings } from "@shared/schema";

export type SettingsPayload = {
  maintenanceMode?: boolean;
  alertEmail?: string;
  theme?: "light" | "dark" | "system";
  notifications?: "all" | "critical" | "none";
};

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

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function createUser(data: { username: string; password: string }): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
}

export async function updateUser(id: string, data: Partial<{ username: string; password: string }>): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete user");
}

export async function fetchSettings(): Promise<Settings> {
  const response = await fetch("/api/settings");
  if (!response.ok) throw new Error("Failed to fetch settings");
  return response.json();
}

export async function updateSettings(data: SettingsPayload): Promise<Settings> {
  const response = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update settings");
  return response.json();
}
