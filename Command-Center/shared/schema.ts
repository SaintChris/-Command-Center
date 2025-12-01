import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const servers = pgTable("servers", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull().unique(),
  name: text("name").notNull().default("Unnamed Server"),
  region: text("region").notNull(),
  status: text("status").notNull(),
  load: integer("load").notNull().default(0),
});

export const insertServerSchema = createInsertSchema(servers)
  .omit({ id: true })
  .extend({ name: z.string().optional() });
export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  subject: text("subject").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

export const networkMetrics = pgTable("network_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  inbound: real("inbound").notNull(),
  outbound: real("outbound").notNull(),
});

export const insertNetworkMetricSchema = createInsertSchema(networkMetrics).omit({ id: true, timestamp: true });
export type InsertNetworkMetric = z.infer<typeof insertNetworkMetricSchema>;
export type NetworkMetric = typeof networkMetrics.$inferSelect;

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  cpuUsage: real("cpu_usage").notNull(),
  memoryUsage: real("memory_usage").notNull(),
  activeNodes: integer("active_nodes").notNull(),
  totalNodes: integer("total_nodes").notNull(),
  networkThroughput: real("network_throughput").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).omit({ id: true, timestamp: true });
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  alertEmail: text("alert_email").notNull().default(""),
  theme: text("theme").notNull().default("system"),
  notifications: text("notifications").notNull().default("all"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
