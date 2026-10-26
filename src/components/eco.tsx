import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, desc, right }: { eyebrow: string; title: string; desc?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{title}</h1>
        {desc && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export function SampleTag({ children = "Sample data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-lime/40 bg-lime/10 px-2 py-0.5 text-[11px] font-medium text-lime">
      {children}
    </span>
  );
}

export function Hint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label="More info" className="text-muted-foreground hover:text-foreground">
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export function StatCard({ label, value, change, goodWhenDown = true, hint, icon, sub }: {
  label: string; value: string; change?: number; goodWhenDown?: boolean; hint?: string; icon?: ReactNode; sub?: string;
}) {
  const good = change === undefined ? true : goodWhenDown ? change <= 0 : change >= 0;
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">{label}{hint && <Hint text={hint} />}</div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium", good ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive")}>
            {change <= 0 ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        {sub && <span className="text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

export function Panel({ title, right, children, className }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-5", className)}>
      {(title || right) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
      <p className="font-display text-lg">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const tooltipStyle = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--popover-foreground)" },
  labelStyle: { color: "var(--muted-foreground)" },
  cursor: { fill: "color-mix(in oklab, var(--primary) 10%, transparent)" },
};
export const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
