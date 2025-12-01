import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertServerSchema,
  insertTicketSchema,
  insertNetworkMetricSchema,
  insertSystemMetricSchema,
  insertUserSchema,
  insertSettingsSchema,
} from "@shared/schema";

// In-memory caches for live data (refreshed periodically)
let liveServersCache: any[] = [];
let liveNetworkCache: any[] = [];
let liveSystemMetricCache: any = null;
let nextNetworkId = 1;

const sanitizeUser = (user: any) => {
  if (!user) return user;
  // never return password hash to clients
  const { password, ...rest } = user;
  return rest;
};


const DEFAULT_FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, ms: number = DEFAULT_FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshLiveData() {
  // Refresh servers from public regions API (Llama Cloud)
  try {
    const res = await fetchWithTimeout("https://api.llama-cloud.com/v1/regions");
    if (!res.ok) throw new Error(`regions fetch status ${res.status}`);
    const regions = await res.json();
    if (Array.isArray(regions) && regions.length > 0) {
      // pick up to 8 regions (first 8 for stability)
      const picked = regions.slice(0, 8);
      liveServersCache = picked.map((r: any, i: number) => {
        // generate status/load
        const statuses = ["healthy", "warning", "critical", "maintenance"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let load = 0;
        if (status === "healthy") load = Math.floor(Math.random() * 61); // 0-60
        else if (status === "warning") load = 60 + Math.floor(Math.random() * 21); //60-80
        else if (status === "critical") load = 80 + Math.floor(Math.random() * 21); //80-100
        else load = 0; // maintenance

        return {
          id: i + 1,
          serverId: r.code || r.id || `region-${i + 1}`,
          region: r.location || r.name || r.country || r.city || "unknown",
          status,
          load,
        };
      });
    }
  } catch (err) {
    console.error("Failed to refresh live servers:", err);
    // leave existing cache (or fallback to storage)
    try {
      const stored = await storage.getAllServers();
      if (Array.isArray(stored) && stored.length > 0 && liveServersCache.length === 0) {
        liveServersCache = stored;
      }
    } catch (e) {
      console.error("Failed to load servers from storage fallback:", e);
    }
  }

  // Refresh network metrics via Cloudflare speed meta (generate synthetic throughput from meta)
  try {
    const res = await fetchWithTimeout("https://speed.cloudflare.com/meta");
    if (!res.ok) throw new Error(`cloudflare meta status ${res.status}`);
    const meta = await res.json();
    // meta may contain ASN/country/city info in different shapes; use what exists
    const asn = meta?.asn || "unknown";
    const country = meta?.country || meta?.geo?.country || "unknown";
    const city = meta?.city || meta?.geo?.city || "unknown";

    // generate 8 recent metrics
    const now = Date.now();
    liveNetworkCache = Array.from({ length: 8 }).map((_, i) => ({
      id: nextNetworkId++,
      timestamp: new Date(now - i * 1000).toISOString(),
      inbound: 1000 + Math.floor(Math.random() * 6000),
      outbound: 1000 + Math.floor(Math.random() * 6000),
      asn,
      country,
      city,
    }));
  } catch (err) {
    console.error("Failed to refresh network metrics:", err);
    // fallback: keep existing cache
  }

  // Refresh system metrics using GitHub rate_limit as a proxy
  try {
    const res = await fetchWithTimeout("https://api.github.com/rate_limit");
    if (!res.ok) throw new Error(`github rate status ${res.status}`);
    const json = await res.json();
    const core = json?.resources?.core || { remaining: 0, limit: 1 };
    const remaining = core.remaining ?? 0;
    const limit = core.limit ?? 1;
    const cpuUsage = Math.max(0, Math.min(100, (remaining / limit) * 100));
    const memoryUsage = 5 + Math.random() * 15; // 5-20
    const networkThroughput = 0.5 + Math.random() * 4.5; // 0.5-5

    liveSystemMetricCache = {
      id: 1,
      cpuUsage,
      memoryUsage,
      activeNodes: remaining,
      totalNodes: limit,
      networkThroughput,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Failed to refresh system metric:", err);
    // fallback: keep existing
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start background refresh when routes are registered
  // Immediately populate caches and then refresh every 15 seconds
  refreshLiveData().catch((e) => {
    console.error("Initial live data refresh failed:", e);
  });
  const interval = setInterval(() => {
    refreshLiveData().catch((err) => console.error("refreshLiveData error:", err));
  }, 15_000);

  // ensure we clear interval if httpServer closes
  httpServer.on("close", () => clearInterval(interval));

  app.get("/api/servers", async (req, res) => {
    try {
      // return cached live servers if available, otherwise fallback to storage
      if (liveServersCache && liveServersCache.length > 0) {
        return res.json(liveServersCache);
      }
      const servers = await storage.getAllServers();
      return res.json(servers);
    } catch (error) {
      console.error("GET /api/servers error:", error);
      return res.status(500).json({ error: "Failed to fetch servers" });
    }
  });

  app.post("/api/servers", async (req, res) => {
    try {
      const validatedData = insertServerSchema.parse(req.body);
      const server = await storage.createServer(validatedData);
      res.status(201).json(server);
    } catch (error) {
      res.status(400).json({ error: "Invalid server data" });
    }
  });

  app.patch("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServerSchema.partial().parse(req.body);
      const server = await storage.updateServer(id, validatedData);
      if (!server) {
        return res.status(404).json({ error: "Server not found" });
      }
      res.json(server);
    } catch (error) {
      res.status(400).json({ error: "Failed to update server" });
    }
  });

  app.delete("/api/servers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServer(id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: "Failed to delete server" });
    }
  });

  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ error: "Invalid ticket data" });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateTicket(id, validatedData);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ error: "Failed to update ticket" });
    }
  });

  app.get("/api/network-metrics", async (req, res) => {
    try {
      const requestedLimit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 20;

      // return cached live network metrics if available
      if (liveNetworkCache && liveNetworkCache.length > 0) {
        return res.json(liveNetworkCache.slice(0, limit));
      }

      const metrics = await storage.getRecentNetworkMetrics(limit);
      return res.json(metrics);
    } catch (error) {
      console.error("GET /api/network-metrics error:", error);
      return res.status(500).json({ error: "Failed to fetch network metrics" });
    }
  });

  app.post("/api/network-metrics", async (req, res) => {
    try {
      const validatedData = insertNetworkMetricSchema.parse(req.body);
      const metric = await storage.createNetworkMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ error: "Invalid metric data" });
    }
  });

  app.get("/api/system-metrics/latest", async (req, res) => {
    try {
      if (liveSystemMetricCache) return res.json(liveSystemMetricCache);
      const metric = await storage.getLatestSystemMetric();
      return res.json(metric || null);
    } catch (error) {
      console.error("GET /api/system-metrics/latest error:", error);
      return res.status(500).json({ error: "Failed to fetch system metrics" });
    }
  });

  app.post("/api/system-metrics", async (req, res) => {
    try {
      const validatedData = insertSystemMetricSchema.parse(req.body);
      const metric = await storage.createSystemMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      res.status(400).json({ error: "Invalid metric data" });
    }
  });

  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(sanitizeUser));
    } catch (error) {
      console.error("GET /api/users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(sanitizeUser(user));
    } catch (error) {
      console.error("POST /api/users error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("PATCH /api/users error:", error);
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      console.error("DELETE /api/users error:", error);
      res.status(400).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/settings", (_req, res) => {
    storage
      .getSettings()
      .then((s) => res.json(s))
      .catch((error) => {
        console.error("GET /api/settings error:", error);
        res.status(500).json({ error: "Failed to fetch settings" });
      });
  });

  app.patch("/api/settings", (req, res) => {
    try {
      const updates = insertSettingsSchema.partial().parse(req.body);
      storage
        .updateSettings(updates)
        .then((settings) => res.json(settings))
        .catch((error) => {
          console.error("PATCH /api/settings error:", error);
          res.status(500).json({ error: "Failed to update settings" });
        });
    } catch (error) {
      console.error("PATCH /api/settings validation error:", error);
      res.status(400).json({ error: "Invalid settings payload" });
    }
  });

  return httpServer;
}
