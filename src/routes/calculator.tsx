import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/eco";
import { DEFAULT_SETTINGS, carbon, comparePeriods, cost, fmtINR, fmtKg, fmtNum } from "@/lib/energy";
import { resetDemo, setState, useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/calculator")({
  head: () => meta("Bill & Carbon Calculator", "Set your tariff and emission factor to estimate electricity bills in ₹ and CO₂ emissions."),
  component: Calc,
});

function Calc() {
  const { settings, entries } = useStore();
  const [tariff, setTariff] = useState(String(settings.tariff));
  const [factor, setFactor] = useState(String(settings.emissionFactor));
  const [name, setName] = useState(settings.householdName);
  const month = comparePeriods(entries, 30).current;
  const [kwh, setKwh] = useState(String(Math.round(month)));

  const t = Number(tariff), f = Number(factor), k = Number(kwh);
  const valid = t > 0 && t <= 50 && f > 0 && f <= 2;

  function save() {
    if (!(t > 0 && t <= 50)) return toast.error("Tariff must be between ₹0 and ₹50 per kWh.");
    if (!(f > 0 && f <= 2)) return toast.error("Emission factor must be between 0 and 2 kg CO₂/kWh.");
    setState((s) => ({ ...s, settings: { tariff: t, emissionFactor: f, householdName: name.trim() || "My Home" } }));
    toast.success("Assumptions saved", { description: "All pages now use the new values." });
  }

  return (
    <>
      <PageHeader eyebrow="Bill & carbon calculator" title="Your numbers, your assumptions" desc="Every rupee and kilogram in EcoPulse is computed from the two values below. Change them to match your electricity bill." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Assumptions">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label htmlFor="name">Household / hostel name</Label><Input id="name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="t">Tariff (₹ per kWh)</Label><Input id="t" type="number" step="0.1" value={tariff} onChange={(e) => setTariff(e.target.value)} />
              <p className="text-xs text-muted-foreground">Find the energy charge per unit on your bill. Slab tariffs: use your average rate.</p></div>
            <div className="space-y-1.5"><Label htmlFor="f">Emission factor (kg CO₂ per kWh)</Label><Input id="f" type="number" step="0.01" value={factor} onChange={(e) => setFactor(e.target.value)} />
              <p className="text-xs text-muted-foreground">Default {DEFAULT_SETTINGS.emissionFactor} is an illustrative value close to published Indian grid averages; check the latest CEA baseline for official figures.</p></div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={save}><Save /> Save assumptions</Button>
              <Button variant="outline" onClick={() => { setTariff(String(DEFAULT_SETTINGS.tariff)); setFactor(String(DEFAULT_SETTINGS.emissionFactor)); }}>Use defaults</Button>
            </div>
          </div>
        </Panel>

        <Panel title="Quick calculation">
          <div className="space-y-1.5"><Label htmlFor="k">Consumption (kWh)</Label><Input id="k" type="number" value={kwh} onChange={(e) => setKwh(e.target.value)} />
            <p className="text-xs text-muted-foreground">Pre-filled with your last 30 days ({fmtNum(month)} kWh).</p></div>
          {valid && k > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Estimated cost</p><p className="mt-1 text-3xl font-semibold">{fmtINR(cost(k, t))}</p><p className="mt-1 text-xs text-muted-foreground">{fmtNum(k)} kWh × ₹{t}</p></div>
              <div className="rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Estimated CO₂</p><p className="mt-1 text-3xl font-semibold">{fmtKg(carbon(k, f))}</p><p className="mt-1 text-xs text-muted-foreground">{fmtNum(k)} kWh × {f} kg</p></div>
              <div className="rounded-xl border p-4 sm:col-span-2 text-sm text-muted-foreground">Equivalent to roughly <b className="text-foreground">{Math.round(carbon(k, f) / 21)}</b> mature trees absorbing CO₂ for a year (≈21 kg/tree/yr, illustrative).</div>
            </div>
          ) : <p className="mt-5 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Enter a positive consumption and valid assumptions to see results.</p>}
        </Panel>
      </div>

      <Panel className="mt-4" title="Formulas & disclosures">
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
          <li><b className="text-foreground">Cost</b> = kWh × tariff. Excludes fixed charges, duties and taxes.</li>
          <li><b className="text-foreground">Carbon</b> = kWh × emission factor. An estimate, not a measurement.</li>
          <li><b className="text-foreground">Savings</b> = baseline estimate − projected estimate.</li>
        </ul>
        <div className="mt-4 border-t pt-4">
          <Button variant="outline" size="sm" onClick={() => { if (confirm("Reset all entries, points and settings to the demo sample?")) { resetDemo(); toast.success("Demo data restored"); window.location.reload(); } }}><RotateCcw /> Reset to demo data</Button>
        </div>
      </Panel>
    </>
  );
}
