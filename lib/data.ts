import raw from "@/data/measurements.json";
import type { Measurements, Member, Scan } from "./types";

const data = raw as Measurements;

const byDate = (a: Scan, b: Scan) =>
  Date.parse(a.measuredAt) - Date.parse(b.measuredAt);

export function getMembers(): Member[] {
  return data.members;
}

export function getMember(id: string): Member | undefined {
  return data.members.find((m) => m.id === id);
}

/** Every scan for one member, oldest first. */
export function getScans(memberId: string): Scan[] {
  return data.scans.filter((s) => s.memberId === memberId).sort(byDate);
}

export function getLatestScan(memberId: string): Scan | undefined {
  return getScans(memberId).at(-1);
}

/**
 * Distinct weigh-in months across the whole group, newest first, as "YYYY-MM".
 * Scans drift by a day or two, so the month is the unit that groups them.
 */
export function getPeriods(): string[] {
  const months = new Set(data.scans.map((s) => s.measuredAt.slice(0, 7)));
  return [...months].sort().reverse();
}

/** True until a second weigh-in exists, so the board has no deltas to rank yet. */
export function isBaselinePeriod(): boolean {
  return getPeriods().length < 2;
}
