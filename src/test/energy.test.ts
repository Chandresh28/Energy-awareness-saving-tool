import { describe, expect, it } from "vitest";
import { carbon, comparePeriods, cost, projectedSavings, toISO, addDays, weeklyGoal, type Entry } from "@/lib/energy";

const today = new Date(2026, 9, 26);
const days = (n: number, kwh: number, offset = 0): Entry[] =>
  Array.from({ length: n }, (_, i) => ({ id: `t${offset + i}`, date: toISO(addDays(today, -(offset + i))), kwh }));

describe("energy formulas", () => {
  it("cost = kWh × tariff", () => expect(cost(100, 7.5)).toBe(750));
  it("carbon = kWh × emission factor", () => expect(carbon(100, 0.71)).toBeCloseTo(71));
  it("savings = baseline − projected", () => expect(projectedSavings(300, 255)).toBe(45));
  it("compares last 30 days with the 30 before", () => {
    const p = comparePeriods([...days(30, 8), ...days(30, 10, 30)], 30, today);
    expect(p.current).toBe(240);
    expect(p.previous).toBe(300);
    expect(p.saved).toBe(60);
    expect(p.changePct).toBeCloseTo(-20);
  });
  it("weekly goal achieved only when usage ≤ previous × (1 − target)", () => {
    const entries = [...days(7, 9), ...days(7, 10, 7)];
    expect(weeklyGoal(entries, 10, today).achieved).toBe(true);
    expect(weeklyGoal(entries, 15, today).achieved).toBe(false);
  });
});
