import { useSyncExternalStore } from "react";
import { DEFAULT_SETTINGS, generateSample, type Entry, type Settings } from "./energy";

export type Challenge = { id: string; title: string; desc: string; points: number; kwh: number };
export const CHALLENGES: Challenge[] = [
  { id: "standby", title: "Standby slayer", desc: "Unplug chargers and idle devices before bed for 3 nights.", points: 50, kwh: 1.5 },
  { id: "ac24", title: "24 °C week", desc: "Keep the AC at 24 °C or higher for 7 days.", points: 120, kwh: 12 },
  { id: "lights", title: "Lights-out hour", desc: "Switch off all non-essential lights for 1 hour on 5 evenings.", points: 60, kwh: 2 },
  { id: "laundry", title: "Full-load laundry", desc: "Run only full washing machine loads this week.", points: 40, kwh: 2.5 },
  { id: "daylight", title: "Daylight study", desc: "Study near a window instead of using lamps for 5 days.", points: 50, kwh: 1.2 },
  { id: "geyser", title: "Geyser timer", desc: "Limit geyser use to 20 minutes per day for a week.", points: 90, kwh: 8 },
];

export type Badge = { id: string; title: string; desc: string; test: (s: State) => boolean };
export const BADGES: Badge[] = [
  { id: "first", title: "First Spark", desc: "Complete your first challenge", test: (s) => s.completed.length >= 1 },
  { id: "three", title: "Habit Builder", desc: "Complete 3 challenges", test: (s) => s.completed.length >= 3 },
  { id: "all", title: "Watt Warrior", desc: "Complete every challenge", test: (s) => s.completed.length >= CHALLENGES.length },
  { id: "p200", title: "Green 200", desc: "Earn 200 points", test: (s) => s.points >= 200 },
  { id: "logger", title: "Data Keeper", desc: "Log 5 of your own entries", test: (s) => s.entries.filter((e) => !e.id.startsWith("s-")).length >= 5 },
];

export type State = {
  entries: Entry[];
  settings: Settings;
  weeklyTargetPct: number; // % reduction vs previous week
  points: number;
  completed: string[];
};

const KEY = "ecopulse:v1";
const listeners = new Set<() => void>();
let state: State | null = null;

function initial(): State {
  return { entries: generateSample(), settings: DEFAULT_SETTINGS, weeklyTargetPct: 10, points: 0, completed: [] };
}

function load(): State {
  if (state) return state;
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    state = raw ? { ...initial(), ...JSON.parse(raw) } : initial();
  } catch {
    state = initial();
  }
  return state!;
}

export function setState(fn: (s: State) => State) {
  state = fn(load());
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore quota */ }
  listeners.forEach((l) => l());
}

export function resetDemo() {
  state = initial();
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useStore(): State {
  return useSyncExternalStore(subscribe, load, load);
}

export const isSample = (e: Entry) => e.id.startsWith("s-");
