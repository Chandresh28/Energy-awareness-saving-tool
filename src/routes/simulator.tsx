import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Slider } from "@/components/ui/slider";
import { PageHeader, Panel, StatCard, axisProps, tooltipStyle } from "@/components/eco";
import { carbon, comparePeriods, cost, fmtINR, fmtKg, fmtNum, projectedSavings } from "@/lib/energy";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/simulator")({
  head: () => meta("Savings Simulator", "Drag a reduction target to see projected kWh, bill savings and emissions avoided."),
  component: Sim,
});

function Sim() {
  const { entries, settings } = useStore();
  const [pct, setPct] = useState(15);
  const baseline = comparePeriods(entries, 30).current;
  const projected = baseline * (1 - pct / 100);
  const kwhSaved = projectedSavings(baseline, projected);
  const rupees = projectedSavings(cost(baseline, settings.tariff), cost(projected, settings.tariff));
  const co2 = projectedSavings(carbon(baseline, settings.emissionFactor), carbon(projected, settings.emissionFactor));
  const data = [
    { name: "Current", kwh: Math.round(baseline) },
    { name: `−${pct}%`, kwh: Math.round(projected) },
  ];

  return (
    <>
      <PageHeader eyebrow="Savings simulator" title="What if you cut back?" desc="Baseline is your last 30 days. Projections assume the same usage pattern reduced by your target." />
      <Panel>
        <div className="flex items-end justify-between"><p className="text-sm text-muted-foreground">Reduction target</p><p className="font-display text-4xl text-lime">{pct}%</p></div>
        <Slider className="mt-4" value={[pct]} min={0} max={50} step={1} onValueChange={([v]) => setPct(v ?? 0)} aria-label="Reduction target" />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>0%</span><span>25%</span><span>50%</span></div>
      </Panel>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Energy saved / month" value={`${fmtNum(kwhSaved)} kWh`} sub={`${fmtNum(kwhSaved * 12)} kWh / year`} />
        <StatCard label="Bill saved / month" value={fmtINR(rupees)} sub={`${fmtINR(rupees * 12)} / year`} />
        <StatCard label="CO₂ avoided / month" value={fmtKg(co2)} sub={`${fmtKg(co2 * 12)} / year`} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Current vs projected (kWh / month)">
          <div className="h-64"><ResponsiveContainer><BarChart data={data}>
            <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" {...axisProps} /><YAxis {...axisProps} width={40} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} kWh`, "Usage"]} />
            <Bar dataKey="kwh" radius={[8, 8, 0, 0]}>{data.map((_, i) => <Cell key={i} fill={i ? "var(--chart-2)" : "var(--chart-3)"} />)}</Bar>
          </BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Side by side">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-2"></th><th>Current</th><th>Projected</th></tr></thead>
            <tbody className="tabular-nums">
              <tr className="border-t"><td className="py-3 text-muted-foreground">Consumption</td><td>{fmtNum(baseline)} kWh</td><td className="text-lime">{fmtNum(projected)} kWh</td></tr>
              <tr className="border-t"><td className="py-3 text-muted-foreground">Est. bill</td><td>{fmtINR(cost(baseline, settings.tariff))}</td><td className="text-lime">{fmtINR(cost(projected, settings.tariff))}</td></tr>
              <tr className="border-t"><td className="py-3 text-muted-foreground">Est. CO₂</td><td>{fmtKg(carbon(baseline, settings.emissionFactor))}</td><td className="text-lime">{fmtKg(carbon(projected, settings.emissionFactor))}</td></tr>
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted-foreground">Savings = baseline estimate − projected estimate, at ₹{settings.tariff}/kWh and {settings.emissionFactor} kg CO₂/kWh. Estimates only.</p>
        </Panel>
      </div>
    </>
  );
}
