import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { servers, tickets, networkMetrics, systemMetrics, users } from "@shared/schema";

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

  await db.insert(servers).values([
    { serverId: "AWS-US-E-1", region: "us-east-1", status: "healthy", load: 45 },
    { serverId: "AWS-US-E-2", region: "us-east-1", status: "healthy", load: 52 },
    { serverId: "AWS-US-W-1", region: "us-west-1", status: "warning", load: 88 },
    { serverId: "GCP-EU-W-1", region: "eu-west-1", status: "healthy", load: 34 },
    { serverId: "GCP-EU-W-2", region: "eu-west-1", status: "maintenance", load: 0 },
    { serverId: "AZ-ASIA-S-1", region: "ap-south-1", status: "critical", load: 98 },
    { serverId: "AZ-ASIA-E-1", region: "ap-east-1", status: "healthy", load: 41 },
    { serverId: "AWS-SA-E-1", region: "sa-east-1", status: "healthy", load: 29 },
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

  await db.insert(users).values([
    { username: "admin", password: "admin123" },
    { username: "analyst", password: "changeme" },
  ]);
  console.log("✅ Users seeded");

  console.log("🎉 Database seeded successfully!");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
