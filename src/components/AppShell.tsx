import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Calculator, ChevronsLeft, Gauge, Lightbulb, Menu, SlidersHorizontal, Trophy, TrendingUp, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/tracker", label: "Tracker", icon: BarChart3 },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/coach", label: "Energy Coach", icon: Lightbulb },
  { to: "/simulator", label: "Simulator", icon: SlidersHorizontal },
  { to: "/goals", label: "Goals & Rewards", icon: Trophy },
  { to: "/insights", label: "Insights", icon: TrendingUp },
] as const;

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand text-primary-foreground shadow-glow">
        <Zap className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-lg font-semibold">EcoPulse</span>
          <span className="block text-[11px] text-muted-foreground">Make Every Watt Count</span>
        </span>
      )}
    </Link>
  );
}

function NavList({ compact, onNav }: { compact?: boolean; onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNav} title={label}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              compact && "justify-center px-0")}>
            <Icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-primary")} />
            {!compact && label}
          </Link>
        );
      })}
    </nav>
  );
}

function PointsPill({ compact }: { compact?: boolean }) {
  const { points } = useStore();
  return (
    <Link to="/goals" className="flex items-center gap-2 rounded-lg border border-lime/30 bg-lime/10 px-3 py-2 text-sm text-lime">
      <Trophy className="h-4 w-4" />{!compact && <span className="font-semibold tabular-nums">{points} pts</span>}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen">
        <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 transition-[width] lg:flex", collapsed ? "w-20" : "w-64")}>
          <Brand compact={collapsed} />
          <div className="mt-8 flex-1"><NavList compact={collapsed} /></div>
          {ready && <PointsPill compact={collapsed} />}
          <button onClick={() => setCollapsed((c) => !c)} className="mt-3 flex items-center justify-center gap-2 rounded-lg py-2 text-xs text-muted-foreground hover:bg-sidebar-accent" aria-label="Toggle sidebar">
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />{!collapsed && "Collapse"}
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
            <Brand />
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg border p-2"><Menu className="h-5 w-5" /></button>
          </header>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <div className="mt-8"><NavList onNav={() => setOpen(false)} /></div>
              <div className="mt-6">{ready && <PointsPill />}</div>
            </SheetContent>
          </Sheet>
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
            {ready ? children : <div className="h-96 animate-pulse rounded-2xl bg-card" />}
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </TooltipProvider>
  );
}
