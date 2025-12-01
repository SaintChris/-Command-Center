import { Activity, Cpu, Globe, HardDrive, Zap } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NetworkGraph } from "@/components/dashboard/NetworkGraph";
import { ServerGrid } from "@/components/dashboard/ServerGrid";
import { TicketList } from "@/components/dashboard/TicketList";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestSystemMetric, fetchServers } from "@/lib/api";

export default function Dashboard() {
  const { data: systemMetric } = useQuery({
    queryKey: ["system-metric"],
    queryFn: fetchLatestSystemMetric,
    refetchInterval: 5000,
  });

  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: fetchServers,
    refetchInterval: 10000,
  });

  const activeNodes = servers.filter(s => s.status !== "maintenance").length;
  const totalNodes = servers.length;
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            System Metrics & Global Infrastructure Status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary animate-pulse">
            LIVE MONITORING
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Last updated: just now
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <MetricCard 
            title="Total CPU Usage" 
            value={systemMetric ? `${systemMetric.cpuUsage.toFixed(1)}%` : "—"} 
            change={systemMetric ? `${systemMetric.cpuUsage > 50 ? '+' : ''}${(systemMetric.cpuUsage - 50).toFixed(1)}%` : ""} 
            trend={systemMetric && systemMetric.cpuUsage > 50 ? "up" : "down"} 
            icon={Cpu} 
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard 
            title="Memory Allocation" 
            value={systemMetric ? `${systemMetric.memoryUsage.toFixed(1)} GB` : "—"} 
            change={systemMetric ? `${systemMetric.memoryUsage > 10 ? '+' : '-'}${Math.abs(systemMetric.memoryUsage - 10).toFixed(1)}%` : ""} 
            trend={systemMetric && systemMetric.memoryUsage > 10 ? "up" : "down"} 
            icon={HardDrive} 
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard 
            title="Active Nodes" 
            value={`${activeNodes}/${totalNodes}`} 
            change={totalNodes - activeNodes > 0 ? `${totalNodes - activeNodes} Maintenance` : "All Active"} 
            trend="neutral" 
            icon={Globe} 
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard 
            title="Network Throughput" 
            value={systemMetric ? `${systemMetric.networkThroughput.toFixed(1)} GB/s` : "—"} 
            change={systemMetric ? `${systemMetric.networkThroughput > 1 ? '+' : '-'}${Math.abs((systemMetric.networkThroughput - 1) * 100).toFixed(0)}%` : ""} 
            trend={systemMetric && systemMetric.networkThroughput > 1 ? "up" : "down"} 
            icon={Zap} 
          />
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-full">
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-4">
          <NetworkGraph />
        </motion.div>
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3">
          <TicketList />
        </motion.div>
      </div>

      {/* Bottom Server Grid */}
      <motion.div variants={item}>
        <ServerGrid />
      </motion.div>
    </motion.div>
  );
}