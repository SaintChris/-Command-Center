import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import crypto from "crypto";
import { servers, tickets, networkMetrics, systemMetrics, users, settings } from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Seeding database...");

  // Ensure idempotent runs for local dev/CI
  await db.delete(networkMetrics);
  await db.delete(systemMetrics);
  await db.delete(tickets);
  await db.delete(servers);
  await db.delete(users);
  await db.delete(settings);

  await db.insert(servers).values([
    { serverId: "AWS-US-E-1", name: "US East - Primary", region: "us-east-1", status: "healthy", load: 45 },
    { serverId: "AWS-US-E-2", name: "US East - Secondary", region: "us-east-1", status: "healthy", load: 52 },
    { serverId: "AWS-US-W-1", name: "US West - Core", region: "us-west-1", status: "warning", load: 88 },
    { serverId: "GCP-EU-W-1", name: "EU West - Core", region: "eu-west-1", status: "healthy", load: 34 },
    { serverId: "GCP-EU-W-2", name: "EU West - Backup", region: "eu-west-1", status: "maintenance", load: 0 },
    { serverId: "AZ-ASIA-S-1", name: "Asia South - Core", region: "ap-south-1", status: "critical", load: 98 },
    { serverId: "AZ-ASIA-E-1", name: "Asia East - Core", region: "ap-east-1", status: "healthy", load: 41 },
    { serverId: "AWS-SA-E-1", name: "South America - Core", region: "sa-east-1", status: "healthy", load: 29 },
  ]);
  console.log("✅ Servers seeded");

  await db.insert(tickets).values([
    { ticketId: "TIK-4928", subject: "VPN Connection Failure - Remote Team", status: "open", priority: "high" },
    { ticketId: "TIK-4927", subject: "Database Latency on Node 4", status: "in-progress", priority: "high" },
    { ticketId: "TIK-4926", subject: "New User Provisioning - Marketing", status: "resolved", priority: "low" },
    { ticketId: "TIK-4925", subject: "License Expiry Warning - Jira", status: "open", priority: "medium" },
    { ticketId: "TIK-4924", subject: "Email Delivery Delays", status: "in-progress", priority: "medium" },
    { ticketId: "TIK-4923", subject: "Printer Config - 2nd Floor", status: "resolved", priority: "low" },
  ]);
  console.log("✅ Tickets seeded");

  const now = new Date();
  const networkData = [];
  for (let i = 20; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
    networkData.push({
      timestamp,
      inbound: Math.random() * 5000 + 2000,
      outbound: Math.random() * 3000 + 1000,
    });
  }
  await db.insert(networkMetrics).values(networkData);
  console.log("✅ Network metrics seeded");

  await db.insert(systemMetrics).values({
    cpuUsage: 42.5,
    memoryUsage: 12.4,
    activeNodes: 84,
    totalNodes: 85,
    networkThroughput: 1.2,
  });
  console.log("✅ System metrics seeded");

  const hash = (password: string) => {
    // deterministic seed hash; runtime hashing uses stronger PBKDF2 iterations
    const salt = crypto.createHash("sha256").update("seed-salt").digest("hex");
    const derived = crypto.pbkdf2Sync(password, salt, 50_000, 64, "sha512").toString("hex");
    return `${salt}:${derived}`;
  };

  await db.insert(users).values([
    { username: "admin", password: hash("admin123") },
    { username: "analyst", password: hash("changeme") },
  ]);
  console.log("✅ Users seeded");

  await db.insert(settings).values({
    maintenanceMode: false,
    alertEmail: "ops@example.com",
    theme: "system",
    notifications: "all",
  });
  console.log("✅ Settings seeded");

  console.log("🎉 Database seeded successfully!");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
