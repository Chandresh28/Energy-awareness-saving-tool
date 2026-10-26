import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Check, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { PageHeader, Panel, SampleTag } from "@/components/eco";
import { cost, fmtINR, fmtNum, weeklyGoal } from "@/lib/energy";
import { BADGES, CHALLENGES, setState, useStore } from "@/lib/store";
import { meta } from "@/lib/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/goals")({
  head: () => meta("Goals & Rewards", "Set weekly energy-saving targets, complete challenges, earn points and badges."),
  component: Goals,
});

const SAMPLE_USERS = [
  { name: "Aarav · Hostel B (sample)", points: 410 },
  { name: "Priya · Flat 3C (sample)", points: 320 },
  { name: "Rohan · Eco Club (sample)", points: 230 },
  { name: "Meera · Day scholar (sample)", points: 140 },
  { name: "Kabir · Lab 2 (sample)", points: 80 },
];

function Goals() {
  const s = useStore();
  const [target, setTarget] = useState(s.weeklyTargetPct);
  const g = weeklyGoal(s.entries, s.weeklyTargetPct);
  const board = [...SAMPLE_USERS, { name: "You", points: s.points, you: true }].sort((a, b) => b.points - a.points);

  function toggle(id: string) {
    const c = CHALLENGES.find((x) => x.id === id)!;
    const done = s.completed.includes(id);
    const before = new Set(BADGES.filter((b) => b.test(s)).map((b) => b.id));
    const next = { ...s, completed: done ? s.completed.filter((x) => x !== id) : [...s.completed, id], points: Math.max(0, s.points + (done ? -c.points : c.points)) };
    setState(() => next);
    if (done) toast(`Challenge reopened (−${c.points} pts)`);
    else {
      toast.success(`+${c.points} points!`, { description: c.title });
      BADGES.filter((b) => !before.has(b.id) && b.test(next)).forEach((b) => toast.success(`Badge unlocked: ${b.title}`, { description: b.desc }));
    }
  }

  return (
    <>
      <PageHeader eyebrow="Goals & rewards" title="Small targets, real wins" desc="Achievable weekly targets plus quick challenges turn good intentions into habits." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="This week's target" right={g.achieved ? <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">On track</span> : <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">Above target</span>}>
          <p className="text-sm text-muted-foreground">Use <b className="text-foreground">{s.weeklyTargetPct}% less</b> than last week ({fmtNum(g.previous)} kWh) → limit <b className="text-foreground">{fmtNum(g.limit)} kWh</b>.</p>
          <div className="mt-4 flex items-end justify-between text-sm"><span>Last 7 days: <b>{fmtNum(g.current)} kWh</b></span><span className="text-muted-foreground">{Math.round(g.progressPct)}% of limit</span></div>
          <Progress value={Math.min(100, g.progressPct)} className="mt-2 h-3" />
          <div className="mt-6 rounded-xl bg-muted p-4">
            <div className="flex items-center justify-between text-sm"><span>Adjust weekly reduction target</span><b className="text-lime">{target}%</b></div>
            <Slider className="mt-3" value={[target]} min={1} max={30} step={1} onValueChange={([v]) => setTarget(v ?? 1)} aria-label="Weekly target" />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Tip: 5–15% is challenging but achievable.</p>
              <Button size="sm" disabled={target === s.weeklyTargetPct} onClick={() => { setState((x) => ({ ...x, weeklyTargetPct: target })); toast.success(`Weekly target set to ${target}%`); }}>Save target</Button>
            </div>
          </div>
        </Panel>

        <Panel title="Leaderboard" right={<SampleTag>Sample users</SampleTag>}>
          <ol className="space-y-2">
            {board.map((u, i) => (
              <li key={u.name} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm", "you" in u ? "border border-lime/40 bg-lime/10" : "bg-muted/50")}>
                <span className="w-5 text-center font-semibold text-muted-foreground">{i === 0 ? <Crown className="h-4 w-4 text-lime" /> : i + 1}</span>
                <span className="flex-1 truncate">{u.name}</span><b className="tabular-nums">{u.points}</b>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel className="mt-4" title="Challenges" right={<span className="text-sm text-muted-foreground"><b className="text-lime">{s.points}</b> points · {s.completed.length}/{CHALLENGES.length} done</span>}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGES.map((c) => {
            const done = s.completed.includes(c.id);
            return (
              <div key={c.id} className={cn("flex flex-col rounded-xl border p-4 transition-colors", done && "border-primary/50 bg-primary/10")}>
                <div className="flex items-start justify-between gap-2"><h3 className="font-semibold">{c.title}</h3><span className="text-xs font-semibold text-lime">+{c.points}</span></div>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.desc}</p>
                <p className="mt-2 text-xs text-muted-foreground">Saves ≈ {c.kwh} kWh · {fmtINR(cost(c.kwh, s.settings.tariff))} (estimate)</p>
                <Button className="mt-3" size="sm" variant={done ? "outline" : "default"} onClick={() => toggle(c.id)}>{done ? <><Check /> Completed — undo</> : "Mark complete"}</Button>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="mt-4" title="Badges">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const got = b.test(s);
            return (
              <div key={b.id} className={cn("rounded-xl border p-4 text-center", got ? "border-lime/50 bg-lime/10" : "opacity-60")}>
                <div className={cn("mx-auto grid h-12 w-12 place-items-center rounded-full", got ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground")}>{got ? <Award /> : <Lock className="h-5 w-5" />}</div>
                <p className="mt-2 text-sm font-semibold">{b.title}</p><p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
