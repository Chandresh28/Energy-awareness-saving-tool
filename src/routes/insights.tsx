import { createFileRoute, Link } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Flame, Gift, MessageSquare, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, axisProps, tooltipStyle } from "@/components/eco";
import { addDays, aggregate, coach, fmtNum, inRange, streak, weeklyGoal } from "@/lib/energy";
import { CHALLENGES, useStore } from "@/lib/store";
import { meta } from "@/lib/meta";

export const Route = createFileRoute("/insights")({
  head: () => meta("Behaviour Insights", "Trends, streaks, achieved goals and next steps for lasting energy-saving habits."),
  component: Insights,
});

function Insights() {
  const s = useStore();
  const today = new Date();
  const weeks = aggregate(inRange(s.entries, addDays(today, -7 * 12 + 1), today), "weekly");
  const g = weeklyGoal(s.entries, s.weeklyTargetPct);
  const dailyLimit = g.limit / 7;
  const st = streak(s.entries, dailyLimit);
  // Count past weeks (rolling 7-day blocks) that beat the previous block by the target.
  const achieved = Array.from({ length: 8 }, (_, i) => weeklyGoal(s.entries, s.weeklyTargetPct, addDays(today, -7 * i)).achieved).filter(Boolean).length;
  const avgWeek = weeks.length ? weeks.reduce((a, w) => a + w.kwh, 0) / weeks.length : 0;
  const nextRec = coach(s.entries)[0];
  const nextChallenge = CHALLENGES.find((c) => !s.completed.includes(c.id));

  return (
    <>
      <PageHeader eyebrow="Behaviour-change insights" title="Is the habit sticking?" desc="Measure progress, celebrate streaks and pick the next small step." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Low-use streak" value={`${st} day${st === 1 ? "" : "s"}`} sub={`days ≤ ${fmtNum(dailyLimit)} kWh`} hint="Consecutive days at or below your weekly target ÷ 7." icon={<Flame className="h-4 w-4" />} />
        <StatCard label="Weeks on target" value={`${achieved} / 8`} sub={`at ${s.weeklyTargetPct}% reduction`} icon={<Target className="h-4 w-4" />} />
        <StatCard label="Challenges completed" value={`${s.completed.length}`} sub={`${s.points} points earned`} icon={<Gift className="h-4 w-4" />} />
      </div>

      <Panel className="mt-4" title="Weekly trend · 12 weeks">
        <div className="h-72"><ResponsiveContainer><LineChart data={weeks}>
          <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="label" {...axisProps} /><YAxis {...axisProps} width={40} />
          <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v} kWh`, "Week"]} />
          <ReferenceLine y={avgWeek} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: "avg", fill: "var(--muted-foreground)", fontSize: 11, position: "right" }} />
          <Line dataKey="kwh" stroke="var(--chart-2)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--chart-2)" }} />
        </LineChart></ResponsiveContainer></div>
        <p className="mt-2 text-xs text-muted-foreground">The first and last bars may cover partial weeks.</p>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Suggested next actions">
          <ul className="space-y-3 text-sm">
            {!g.achieved && <li className="rounded-lg bg-muted p-3">You're {fmtNum(Math.max(0, g.current - g.limit))} kWh above this week's limit — try one low-use evening.</li>}
            {g.achieved && <li className="rounded-lg bg-primary/10 p-3">You're on target this week. Consider raising the target by 2–3% on the Goals page.</li>}
            {nextRec && <li className="rounded-lg bg-muted p-3"><b>{nextRec.title}:</b> {nextRec.action}</li>}
            {nextChallenge && <li className="rounded-lg bg-muted p-3">Next challenge: <b>{nextChallenge.title}</b> (+{nextChallenge.points} pts)</li>}
          </ul>
          <div className="mt-4 flex gap-2"><Button asChild size="sm"><Link to="/goals">Go to goals</Link></Button><Button asChild size="sm" variant="outline"><Link to="/tracker">Log a reading</Link></Button></div>
        </Panel>
        <Panel title="Why this works">
          <div className="space-y-4 text-sm">
            {[
              { i: MessageSquare, t: "Feedback", d: "Seeing usage in kWh, rupees and CO₂ makes an invisible resource visible — people consistently use less when they can see consumption." },
              { i: Target, t: "Achievable targets", d: "Specific, modest goals (like 10% less than last week) feel doable, so people start — and keep going." },
              { i: Gift, t: "Rewards", d: "Points, badges and a friendly leaderboard give quick wins while the bill savings take a month to appear." },
            ].map(({ i: I, t, d }) => (
              <div key={t} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-primary"><I className="h-4 w-4" /></span><div><p className="font-semibold">{t}</p><p className="text-muted-foreground">{d}</p></div></div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
