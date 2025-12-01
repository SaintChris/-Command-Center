import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertServerSchema, insertTicketSchema, insertNetworkMetricSchema, insertSystemMetricSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/servers", async (req, res) => {
    try {
      const servers = await storage.getAllServers();
      res.json(servers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch servers" });
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
      const server = await storage.updateServer(id, req.body);
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
      const ticket = await storage.updateTicket(id, req.body);
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
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const metrics = await storage.getRecentNetworkMetrics(limit);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network metrics" });
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
      const metric = await storage.getLatestSystemMetric();
      res.json(metric || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system metrics" });
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

  return httpServer;
}
