import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState, PageHeader, Panel, SampleTag, axisProps, tooltipStyle } from "@/components/eco";
import { addDays, aggregate, cost, fmtINR, fmtNum, inRange, parseISO, toISO, type Granularity } from "@/lib/energy";
import { isSample, setState, useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tracker")({
  head: () => meta("Consumption Tracker", "Log daily or monthly electricity readings in kWh and explore daily, weekly and monthly charts."),
  component: Tracker,
});

const RANGES = { daily: [14, 30, 60], weekly: [8, 12, 17], monthly: [3, 4, 6] } as const;

function Seg<T extends string | number>({ value, options, onChange, fmt }: { value: T; options: readonly T[]; onChange: (v: T) => void; fmt?: (v: T) => string }) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button key={String(o)} onClick={() => onChange(o)} className={cn("rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors", value === o ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
          {fmt ? fmt(o) : String(o)}
        </button>
      ))}
    </div>
  );
}

function Tracker() {
  const { entries, settings } = useStore();
  const [g, setG] = useState<Granularity>("daily");
  const [range, setRange] = useState<number>(30);
  const [editing, setEditing] = useState<string | null>(null);
  const [mode, setMode] = useState<"day" | "month">("day");
  const [date, setDate] = useState(toISO(new Date()));
  const [kwh, setKwh] = useState("");
  const [note, setNote] = useState("");

  const chart = useMemo(() => {
    const today = new Date();
    const days = g === "daily" ? range : g === "weekly" ? range * 7 : range * 31;
    return aggregate(inRange(entries, addDays(today, -(days - 1)), today), g).slice(-range);
  }, [entries, g, range]);

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries]);
  const [limit, setLimit] = useState(15);

  function reset() { setEditing(null); setKwh(""); setNote(""); setDate(toISO(new Date())); setMode("day"); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(kwh);
    if (!kwh || !Number.isFinite(v) || v <= 0) return toast.error("Enter a consumption above 0 kWh.");
    if (mode === "day" && v > 200) return toast.error("That's over 200 kWh in a day — please double-check the reading.");
    if (!date) return toast.error("Pick a date.");
    if (date > toISO(new Date())) return toast.error("Readings can't be in the future.");

    if (editing) {
      setState((s) => ({ ...s, entries: s.entries.map((x) => (x.id === editing ? { ...x, date, kwh: v, note: note || undefined, id: x.id.startsWith("s-") ? `u-${crypto.randomUUID()}` : x.id } : x)) }));
      toast.success("Entry updated");
    } else if (mode === "month") {
      // Spread a monthly total evenly across the days of that month.
      const [y, m] = date.split("-").map(Number);
      const n = new Date(y, m, 0).getDate();
      const per = Math.round((v / n) * 100) / 100;
      const prefix = `${y}-${String(m).padStart(2, "0")}`;
      const added = Array.from({ length: n }, (_, i) => ({ id: `u-${crypto.randomUUID()}`, date: `${prefix}-${String(i + 1).padStart(2, "0")}`, kwh: per, note: note || "Monthly bill (spread)" }));
      setState((s) => ({ ...s, entries: [...s.entries.filter((x) => !x.date.startsWith(prefix)), ...added] }));
      toast.success(`Monthly total saved`, { description: `${fmtNum(v)} kWh spread as ${per} kWh/day across ${n} days.` });
    } else {
      setState((s) => ({ ...s, entries: [...s.entries.filter((x) => x.date !== date), { id: `u-${crypto.randomUUID()}`, date, kwh: v, note: note || undefined }] }));
      toast.success("Reading saved", { description: `${fmtNum(v)} kWh on ${parseISO(date).toLocaleDateString("en-IN")}` });
    }
    reset();
  }

  function remove(id: string) {
    const prev = entries;
    setState((s) => ({ ...s, entries: s.entries.filter((x) => x.id !== id) }));
    toast("Entry deleted", { action: { label: "Undo", onClick: () => setState((s) => ({ ...s, entries: prev })) } });
  }

  return (
    <>
      <PageHeader eyebrow="Consumption tracker" title="Every reading, in one place" desc="Add a daily meter reading or a monthly bill total. One entry is kept per day — adding a reading for an existing day replaces it." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Usage over time" right={
          <div className="flex flex-wrap gap-2">
            <Seg value={g} options={["daily", "weekly", "monthly"] as const} onChange={(v) => { setG(v); setRange(RANGES[v][1]); }} />
            <Seg value={range} options={RANGES[g] as readonly number[]} onChange={setRange} fmt={(v) => `${v}${g[0]}`} />
          </div>}>
          {chart.length === 0 ? <EmptyState title="No readings in this range" desc="Add a reading or choose a longer range." /> : (
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={chart}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" {...axisProps} minTickGap={16} />
                  <YAxis {...axisProps} width={40} />
                  <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} kWh · ${fmtINR(cost(v, settings.tariff))}`, "Usage"]} />
                  <Bar dataKey="kwh" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground">Total shown: <b className="text-foreground">{fmtNum(chart.reduce((s, c) => s + c.kwh, 0))} kWh</b> · {fmtINR(cost(chart.reduce((s, c) => s + c.kwh, 0), settings.tariff))}</p>
        </Panel>

        <Panel title={editing ? "Edit entry" : "Add reading"} right={editing && <Button size="sm" variant="ghost" onClick={reset}><X /> Cancel</Button>}>
          <form onSubmit={submit} className="space-y-4">
            {!editing && <Seg value={mode} options={["day", "month"] as const} onChange={setMode} fmt={(v) => (v === "day" ? "Daily reading" : "Monthly total")} />}
            <div className="space-y-1.5">
              <Label htmlFor="date">{mode === "month" ? "Month" : "Date"}</Label>
              {mode === "month"
                ? <Input id="date" type="month" value={date.slice(0, 7)} max={toISO(new Date()).slice(0, 7)} onChange={(e) => setDate(e.target.value + "-01")} />
                : <Input id="date" type="date" value={date} max={toISO(new Date())} onChange={(e) => setDate(e.target.value)} />}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kwh">Consumption (kWh)</Label>
              <Input id="kwh" type="number" step="0.1" min="0" inputMode="decimal" placeholder={mode === "month" ? "e.g. 280" : "e.g. 9.4"} value={kwh} onChange={(e) => setKwh(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" maxLength={60} placeholder="Guests over, AC all day…" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">{editing ? "Save changes" : <><Plus /> Add entry</>}</Button>
            {kwh && Number(kwh) > 0 && <p className="text-xs text-muted-foreground">≈ {fmtINR(cost(Number(kwh), settings.tariff))} at ₹{settings.tariff}/kWh</p>}
          </form>
        </Panel>
      </div>

      <Panel className="mt-4" title={`All entries (${entries.length})`}>
        {sorted.length === 0 ? <EmptyState title="No entries yet" desc="Add your first meter reading above to start tracking." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">Date</th><th>kWh</th><th>Est. cost</th><th>Source</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {sorted.slice(0, limit).map((e) => (
                  <tr key={e.id} className={cn("border-b last:border-0", editing === e.id && "bg-accent/40")}>
                    <td className="py-2.5">{parseISO(e.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="tabular-nums">{fmtNum(e.kwh)}</td>
                    <td className="tabular-nums">{fmtINR(cost(e.kwh, settings.tariff))}</td>
                    <td>{isSample(e) ? <SampleTag /> : <span className="text-xs text-muted-foreground">{e.note ?? "You"}</span>}</td>
                    <td className="text-right">
                      <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => { setEditing(e.id); setMode("day"); setDate(e.date); setKwh(String(e.kwh)); setNote(isSample(e) ? "" : e.note ?? ""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>
                      <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(e.id)}><Trash2 className="text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {limit < sorted.length && <Button variant="ghost" className="mt-3 w-full" onClick={() => setLimit((l) => l + 30)}>Show more</Button>}
          </div>
        )}
      </Panel>
    </>
  );
}
