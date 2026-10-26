// Pure calculation helpers — the single source of truth for every formula in the app.
export type Entry = { id: string; date: string; kwh: number; note?: string };
export type Settings = { tariff: number; emissionFactor: number; householdName: string };

export const DEFAULT_SETTINGS: Settings = {
  tariff: 7.5, // ₹/kWh — illustrative average residential tariff (configurable)
  emissionFactor: 0.71, // kg CO₂/kWh — illustrative grid factor (configurable)
  householdName: "My Home",
};

export const cost = (kwh: number, tariff: number) => kwh * tariff;
export const carbon = (kwh: number, factor: number) => kwh * factor;
export const projectedSavings = (baseline: number, projected: number) => baseline - projected;

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
export const fmtINR = (v: number) => inr.format(v);
export const fmtNum = (v: number) => num.format(v);
export const fmtKg = (v: number) => (v >= 1000 ? `${num.format(v / 1000)} t` : `${num.format(v)} kg`);

export const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

export const sumKwh = (entries: Entry[]) => entries.reduce((s, e) => s + e.kwh, 0);

export function inRange(entries: Entry[], from: Date, to: Date) {
  const f = toISO(from), t = toISO(to);
  return entries.filter((e) => e.date >= f && e.date <= t);
}

/** Compare the last `days` days (ending today) with the `days` before that. */
export function comparePeriods(entries: Entry[], days: number, today = new Date()) {
  const cur = inRange(entries, addDays(today, -(days - 1)), today);
  const prev = inRange(entries, addDays(today, -(2 * days - 1)), addDays(today, -days));
  const c = sumKwh(cur), p = sumKwh(prev);
  return { current: c, previous: p, changePct: p > 0 ? ((c - p) / p) * 100 : 0, saved: Math.max(0, p - c), curEntries: cur };
}

export type Granularity = "daily" | "weekly" | "monthly";

function weekStart(d: Date) {
  const c = new Date(d);
  const day = (c.getDay() + 6) % 7; // Monday start
  c.setDate(c.getDate() - day);
  return c;
}

export function aggregate(entries: Entry[], g: Granularity) {
  const map = new Map<string, number>();
  for (const e of entries) {
    const d = parseISO(e.date);
    const key = g === "daily" ? e.date : g === "weekly" ? toISO(weekStart(d)) : e.date.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + e.kwh);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, kwh]) => {
      const d = g === "monthly" ? parseISO(key + "-01") : parseISO(key);
      const label =
        g === "monthly"
          ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
          : (g === "weekly" ? "Wk " : "") + d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      return { key, label, kwh: Math.round(kwh * 10) / 10 };
    });
}

/** Deterministic realistic sample: 120 days, gentle improvement over the last month. */
export function generateSample(today = new Date()): Entry[] {
  const out: Entry[] = [];
  let seed = 42;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 119; i >= 0; i--) {
    const d = addDays(today, -i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const month = d.getMonth();
    const summer = month >= 3 && month <= 6 ? 2.5 : 0;
    const improvement = i < 30 ? 0.86 : 1;
    const kwh = (8.2 + summer + (weekend ? 2.6 : 0) + rand() * 2.4) * improvement;
    out.push({ id: `s-${toISO(d)}`, date: toISO(d), kwh: Math.round(kwh * 10) / 10, note: "Sample data" });
  }
  return out;
}

export type Recommendation = {
  id: string; title: string; reason: string; action: string;
  kwhPerMonth: number; difficulty: "Easy" | "Medium" | "Hard";
};

/** Rule-based coach (no AI). Every rule reads only the user's entries. */
export function coach(entries: Entry[], today = new Date()): Recommendation[] {
  const last30 = inRange(entries, addDays(today, -29), today);
  if (last30.length < 5) return [];
  const avg = sumKwh(last30) / last30.length;
  const recs: Recommendation[] = [];
  const wkend = last30.filter((e) => [0, 6].includes(parseISO(e.date).getDay()));
  const wkday = last30.filter((e) => ![0, 6].includes(parseISO(e.date).getDay()));
  const avgEnd = wkend.length ? sumKwh(wkend) / wkend.length : 0;
  const avgDay = wkday.length ? sumKwh(wkday) / wkday.length : 0;
  if (avgEnd > avgDay * 1.15 && wkday.length) {
    const extra = avgEnd - avgDay;
    recs.push({
      id: "weekend", title: "Trim your weekend spikes", difficulty: "Easy",
      reason: `Weekend days average ${fmtNum(avgEnd)} kWh vs ${fmtNum(avgDay)} kWh on weekdays (+${Math.round((extra / avgDay) * 100)}%).`,
      action: "Batch laundry into one full load, air-dry clothes, and switch off TVs/consoles at the plug instead of standby.",
      kwhPerMonth: Math.round(extra * 0.5 * 8.6),
    });
  }
  if (avg > 9) {
    recs.push({
      id: "cooling", title: "Set AC to 24 °C and use timers", difficulty: "Easy",
      reason: `Your daily average of ${fmtNum(avg)} kWh is above a typical ~9 kWh urban household; cooling is usually the largest load.`,
      action: "Each degree higher saves roughly 6% of AC energy. Use the sleep/timer mode and pair with a ceiling fan.",
      kwhPerMonth: Math.round(avg * 30 * 0.08),
    });
  }
  const peak = [...last30].sort((a, b) => b.kwh - a.kwh)[0];
  if (peak && peak.kwh > avg * 1.3) {
    recs.push({
      id: "peak", title: "Investigate your peak day", difficulty: "Medium",
      reason: `${parseISO(peak.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} hit ${fmtNum(peak.kwh)} kWh — ${Math.round((peak.kwh / avg - 1) * 100)}% above your average.`,
      action: "Note which appliances ran that day (geyser, iron, guests, cooking). Repeat offenders are your best targets.",
      kwhPerMonth: Math.round((peak.kwh - avg) * 2),
    });
  }
  const first = last30.slice(0, 15), second = last30.slice(15);
  if (second.length && sumKwh(second) / second.length > (sumKwh(first) / Math.max(1, first.length)) * 1.05) {
    recs.push({
      id: "trend", title: "Usage is creeping up", difficulty: "Medium",
      reason: "Your last two weeks average more than the two weeks before.",
      action: "Set a weekly target on the Goals page and check the tracker every evening for a week.",
      kwhPerMonth: Math.round(avg * 30 * 0.05),
    });
  }
  recs.push({
    id: "led", title: "Swap remaining bulbs for LEDs", difficulty: "Easy",
    reason: "Lighting is 10–15% of household use; LEDs use about 75% less than incandescent bulbs.",
    action: "Replace the 3 most-used bulbs first (kitchen, living room, study).",
    kwhPerMonth: Math.round(Math.max(4, avg * 30 * 0.04)),
  });
  recs.push({
    id: "fridge", title: "Upgrade to a 5-star appliance", difficulty: "Hard",
    reason: "Old refrigerators and ACs run continuously and can use 30–40% more than BEE 5-star models.",
    action: "When replacing, compare BEE star labels and annual kWh ratings printed on the sticker.",
    kwhPerMonth: Math.round(Math.max(10, avg * 30 * 0.1)),
  });
  return recs;
}

/** Weekly goal: this week (last 7 days) must be ≤ previous 7 days × (1 − target%). */
export function weeklyGoal(entries: Entry[], targetPct: number, today = new Date()) {
  const p = comparePeriods(entries, 7, today);
  const limit = p.previous * (1 - targetPct / 100);
  return { ...p, limit, achieved: p.previous > 0 && p.current <= limit, progressPct: limit > 0 ? (p.current / limit) * 100 : 0 };
}

/** Consecutive days (ending today/yesterday) where usage was at or below the daily limit. */
export function streak(entries: Entry[], dailyLimit: number, today = new Date()) {
  const byDate = new Map(entries.map((e) => [e.date, e.kwh]));
  let n = 0;
  let d = byDate.has(toISO(today)) ? today : addDays(today, -1);
  while (true) {
    const v = byDate.get(toISO(d));
    if (v === undefined || v > dailyLimit) break;
    n++; d = addDays(d, -1);
  }
  return n;
}
