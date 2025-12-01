import { 
  type User, 
  type InsertUser,
  type Server,
  type InsertServer,
  type Ticket,
  type InsertTicket,
  type NetworkMetric,
  type InsertNetworkMetric,
  type SystemMetric,
  type InsertSystemMetric,
  users,
  servers,
  tickets,
  networkMetrics,
  systemMetrics,
} from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc, eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllServers(): Promise<Server[]>;
  getServer(id: number): Promise<Server | undefined>;
  createServer(server: InsertServer): Promise<Server>;
  updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined>;
  deleteServer(id: number): Promise<void>;
  
  getAllTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined>;
  deleteTicket(id: number): Promise<void>;
  
  getRecentNetworkMetrics(limit: number): Promise<NetworkMetric[]>;
  createNetworkMetric(metric: InsertNetworkMetric): Promise<NetworkMetric>;
  
  getLatestSystemMetric(): Promise<SystemMetric | undefined>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllServers(): Promise<Server[]> {
    return await db.select().from(servers);
  }

  async getServer(id: number): Promise<Server | undefined> {
    const result = await db.select().from(servers).where(eq(servers.id, id)).limit(1);
    return result[0];
  }

  async createServer(server: InsertServer): Promise<Server> {
    const result = await db.insert(servers).values(server).returning();
    return result[0];
  }

  async updateServer(id: number, server: Partial<InsertServer>): Promise<Server | undefined> {
    const result = await db.update(servers).set(server).where(eq(servers.id, id)).returning();
    return result[0];
  }

  async deleteServer(id: number): Promise<void> {
    await db.delete(servers).where(eq(servers.id, id));
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const result = await db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    return result[0];
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const result = await db.insert(tickets).values(ticket).returning();
    return result[0];
  }

  async updateTicket(id: number, ticket: Partial<InsertTicket>): Promise<Ticket | undefined> {
    const result = await db.update(tickets).set(ticket).where(eq(tickets.id, id)).returning();
    return result[0];
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  }

  async getRecentNetworkMetrics(limit: number = 20): Promise<NetworkMetric[]> {
    return await db.select().from(networkMetrics).orderBy(desc(networkMetrics.timestamp)).limit(limit);
  }

  async createNetworkMetric(metric: InsertNetworkMetric): Promise<NetworkMetric> {
    const result = await db.insert(networkMetrics).values(metric).returning();
    return result[0];
  }

  async getLatestSystemMetric(): Promise<SystemMetric | undefined> {
    const result = await db.select().from(systemMetrics).orderBy(desc(systemMetrics.timestamp)).limit(1);
    return result[0];
  }

  async createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric> {
    const result = await db.insert(systemMetrics).values(metric).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
