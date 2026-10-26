import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Factory, IndianRupee, Leaf, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, SampleTag, StatCard, axisProps, tooltipStyle } from "@/components/eco";
import { aggregate, carbon, coach, comparePeriods, cost, fmtINR, fmtKg, fmtNum, addDays, inRange } from "@/lib/energy";
import { useStore, isSample } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => meta("Dashboard", "Your electricity use, bill, carbon footprint and savings at a glance."),
  component: Dashboard,
});

function Dashboard() {
  const { entries, settings, points, completed } = useStore();
  const p = comparePeriods(entries, 30);
  const chart = aggregate(inRange(entries, addDays(new Date(), -59), new Date()), "daily");
  const recs = coach(entries).slice(0, 3);
  const hasSample = entries.some(isSample);

  return (
    <>
      <section className="bg-hero relative mb-6 overflow-hidden rounded-2xl border p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{settings.householdName} · last 30 days</p>
          {hasSample && <SampleTag>Includes sample data</SampleTag>}
        </div>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-5xl">
          You used <span className="text-lime">{fmtNum(p.current)} kWh</span> this month
          {p.changePct < 0 ? <> — {Math.abs(p.changePct).toFixed(0)}% less than before.</> : <> — {p.changePct.toFixed(0)}% more than before.</>}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">Understand your consumption, discover waste, take action and measure the savings.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-brand text-primary-foreground shadow-glow hover:opacity-90"><Link to="/tracker">Log today's reading <ArrowRight /></Link></Button>
          <Button asChild variant="outline"><Link to="/coach">See where you waste energy</Link></Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Consumption" value={`${fmtNum(p.current)} kWh`} change={p.changePct} sub="vs previous 30 days" icon={<Zap className="h-4 w-4" />} />
        <StatCard label="Estimated bill" value={fmtINR(cost(p.current, settings.tariff))} change={p.changePct} sub={`@ ₹${settings.tariff}/kWh`} hint="kWh × your configured tariff. Excludes fixed charges and taxes." icon={<IndianRupee className="h-4 w-4" />} />
        <StatCard label="Est. CO₂ emissions" value={fmtKg(carbon(p.current, settings.emissionFactor))} change={p.changePct} sub={`@ ${settings.emissionFactor} kg/kWh`} hint="kWh × your configured grid emission factor. An estimate, not a measured value." icon={<Factory className="h-4 w-4" />} />
        <StatCard label="Energy saved" value={`${fmtNum(p.saved)} kWh`} sub={`≈ ${fmtINR(cost(p.saved, settings.tariff))} · ${fmtKg(carbon(p.saved, settings.emissionFactor))} CO₂`} hint="Previous 30 days minus last 30 days (zero if usage rose)." icon={<Leaf className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Daily consumption · 60 days" right={<Button asChild size="sm" variant="ghost"><Link to="/tracker">Open tracker <ArrowRight /></Link></Button>}>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" {...axisProps} minTickGap={24} />
                <YAxis {...axisProps} width={32} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} kWh`, "Usage"]} />
                <Area dataKey="kwh" stroke="var(--chart-1)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Top coach tips" right={<SampleTag>Rule-based</SampleTag>}>
          <ul className="space-y-3">
            {recs.map((r) => (
              <li key={r.id} className="rounded-lg bg-muted/60 p-3">
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Save ~{r.kwhPerMonth} kWh/mo · {fmtINR(cost(r.kwhPerMonth, settings.tariff))}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-lime/30 bg-lime/10 p-3 text-sm">
            <span><b className="text-lime">{points}</b> pts · {completed.length} challenges done</span>
            <Link to="/goals" className="text-lime underline-offset-4 hover:underline">Goals</Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
