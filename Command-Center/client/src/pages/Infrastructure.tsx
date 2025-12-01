import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, Cloud, Server as ServerIcon } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { NetworkGraph } from "@/components/dashboard/NetworkGraph";
import { ServerGrid } from "@/components/dashboard/ServerGrid";
import { useQuery } from "@tanstack/react-query";
import { fetchServers } from "@/lib/api";

export default function Infrastructure() {
  const { data: servers = [] } = useQuery({
    queryKey: ["servers"],
    queryFn: fetchServers,
    refetchInterval: 10000,
  });

  const metrics = useMemo(() => {
    const active = servers.filter((s) => s.status !== "maintenance").length;
    const critical = servers.filter((s) => s.status === "critical").length;
    return { active, total: servers.length, critical };
  }, [servers]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
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
          <h2 className="text-3xl font-bold tracking-tight">Infrastructure</h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Live topology, server health, and environment overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary">
            UPDATED EVERY 10s
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Nodes: {metrics.total || "—"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={item}>
          <MetricCard
            title="Active Nodes"
            value={`${metrics.active}/${metrics.total || "—"}`}
            change={metrics.total - metrics.active > 0 ? `${metrics.total - metrics.active} maintenance` : "All active"}
            trend="neutral"
            icon={ServerIcon}
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard
            title="Critical Alerts"
            value={`${metrics.critical}`}
            change={metrics.critical > 0 ? "Action required" : "Stable"}
            trend={metrics.critical > 0 ? "down" : "up"}
            icon={Shield}
          />
        </motion.div>
        <motion.div variants={item}>
          <MetricCard
            title="Regions Monitored"
            value={`${Math.max(servers.length, 1)}`}
            change={servers.length ? "Live" : "Awaiting data"}
            trend="neutral"
            icon={Cloud}
          />
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 h-full">
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-4">
          <NetworkGraph />
        </motion.div>
        <motion.div variants={item} className="col-span-1 md:col-span-2 lg:col-span-3">
          <ServerGrid />
        </motion.div>
      </div>
    </motion.div>
  );
}
