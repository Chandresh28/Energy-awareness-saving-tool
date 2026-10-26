import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, SampleTag } from "@/components/eco";
import { carbon, coach, cost, fmtINR, fmtKg } from "@/lib/energy";
import { useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach")({
  head: () => meta("Energy Coach", "Personalised, rule-based energy-saving recommendations from your own consumption data."),
  component: Coach,
});

const DIFF = { Easy: "bg-primary/15 text-primary", Medium: "bg-chart-4/15 text-chart-4", Hard: "bg-destructive/15 text-destructive" };

function Coach() {
  const { entries, settings } = useStore();
  const recs = coach(entries);
  const total = recs.reduce((s, r) => s + r.kwhPerMonth, 0);

  return (
    <>
      <PageHeader eyebrow="Energy coach" title="Where your watts are leaking" desc="These tips come from transparent rules applied to your last 30 days of readings — no AI service is connected."
        right={<SampleTag>Rule-based estimates</SampleTag>} />
      {recs.length === 0 ? (
        <EmptyState title="Not enough data yet" desc="Log at least 5 days in the last month and the coach will analyse your patterns." action={<Button asChild><Link to="/tracker">Add readings</Link></Button>} />
      ) : (
        <>
          <div className="mb-4 rounded-2xl border border-lime/30 bg-lime/10 p-5">
            <p className="text-sm text-muted-foreground">If you follow every tip, you could save about</p>
            <p className="mt-1 font-display text-3xl text-lime">{total} kWh / month · {fmtINR(cost(total, settings.tariff))} · {fmtKg(carbon(total, settings.emissionFactor))} CO₂</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recs.map((r) => (
              <Panel key={r.id}>
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary"><Lightbulb className="h-5 w-5" /></span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold">{r.title}</h3>
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", DIFF[r.difficulty])}>{r.difficulty}</span></div>
                    <p className="mt-2 text-sm"><span className="text-muted-foreground">Why: </span>{r.reason}</p>
                    <p className="mt-1 text-sm"><span className="text-muted-foreground">Do: </span>{r.action}</p>
                    <p className="mt-3 text-sm font-medium text-primary">≈ {r.kwhPerMonth} kWh/mo · {fmtINR(cost(r.kwhPerMonth, settings.tariff))} · {fmtKg(carbon(r.kwhPerMonth, settings.emissionFactor))} CO₂</p>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/simulator">Simulate the savings</Link></Button><Button asChild variant="outline"><Link to="/goals">Turn tips into challenges</Link></Button></div>
        </>
      )}
    </>
  );
}
