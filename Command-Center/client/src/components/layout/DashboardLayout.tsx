import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Server, ShieldCheck, Users, Settings, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 font-mono text-sm h-12 ${
            isActive 
              ? "bg-primary/10 text-primary border-r-2 border-primary rounded-none" 
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">CYBER<span className="text-primary">OPS</span></h1>
          <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">Command Center v2.0</p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search systems..." 
            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/50 font-mono text-xs h-9" 
          />
        </div>
      </div>

      <nav className="flex-1 py-6 space-y-1 px-2">
        <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/infrastructure" icon={Server} label="Infrastructure" />
        <NavItem href="/users" icon={Users} label="Access Control" />
        <NavItem href="/settings" icon={Settings} label="System Config" />
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-card/50 p-3 rounded border border-border/50 flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-primary/20">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-success font-mono flex items-center gap-1">
              <span className="block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              ONLINE
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden scanline">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute left-4 top-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r-sidebar-border bg-sidebar">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 md:ml-64 relative overflow-y-auto h-screen">
        <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-background/50 border-b border-border/50 h-16 flex items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono">SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full animate-ping" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </Button>
          </div>
        </header>
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}