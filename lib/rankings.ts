import { type Condition, conditionOf } from "./condition";
import { getMembers, getScans } from "./data";
import { ffmi, heightFor } from "./metrics";
import type { Goal, Member, Scan } from "./types";

/**
 * Scoring is per goal, because ranking a bulker and a cutter on one axis makes
 * one of them lose by definition. Each goal rewards the thing that goal is
 * actually about and penalises the failure mode specific to it:
 *
 *   cut    fat off, but losing lean is punished hard (that is crash dieting)
 *   gain   lean on, with some fat gain tolerated (that is how bulking works)
 *   recomp both directions matter equally
 *
 * The ceilings are deliberately similar across goals, so picking a goal is a
 * statement of intent and not a way to farm points. Goals are set before the
 * weigh-in, never after seeing the numbers.
 */
export const GOAL_WEIGHTS: Record<
  Goal,
  {
    label: string;
    /** Per 1% of your own starting fat mass lost. */
    fatLoss: number;
    /** Per 1% gained. Applied as a penalty. */
    fatGain: number;
    /** Per kg of lean mass gained. */
    leanGain: number;
    /** Per kg lost. Applied as a penalty. */
    leanLoss: number;
    /** Per point of visceral fat index dropped or gained. */
    visceral: number;
  }
> = {
  cut: {
    label: "Cutting",
    fatLoss: 3,
    fatGain: 3,
    leanGain: 6,
    leanLoss: 15,
    visceral: 5,
  },
  recomp: {
    label: "Recomp",
    fatLoss: 2,
    fatGain: 2,
    leanGain: 10,
    leanLoss: 10,
    visceral: 5,
  },
  gain: {
    label: "Gaining",
    fatLoss: 1,
    fatGain: 1,
    leanGain: 15,
    leanLoss: 15,
    visceral: 3,
  },
};

export type ProgressBreakdown = {
  goal: Goal;
  fatDeltaKg: number;
  fatDeltaPercent: number;
  leanDeltaKg: number;
  visceralDelta: number;
  fatPoints: number;
  leanPoints: number;
  visceralPoints: number;
  total: number;
};

/** Progress from one scan to another, scored against the member's goal. */
export function progressBetween(
  from: Scan,
  to: Scan,
  goal: Goal,
): ProgressBreakdown {
  const w = GOAL_WEIGHTS[goal];

  const fatDeltaKg = to.fatMass - from.fatMass;
  const fatDeltaPercent = (fatDeltaKg / from.fatMass) * 100;
  const leanDeltaKg = to.leanMass - from.leanMass;
  const visceralDelta = to.visceralFatIndex - from.visceralFatIndex;

  const fatPoints =
    fatDeltaKg <= 0
      ? -fatDeltaPercent * w.fatLoss
      : -fatDeltaPercent * w.fatGain;
  const leanPoints =
    leanDeltaKg >= 0 ? leanDeltaKg * w.leanGain : leanDeltaKg * w.leanLoss;
  const visceralPoints = -visceralDelta * w.visceral;

  return {
    goal,
    fatDeltaKg,
    fatDeltaPercent,
    leanDeltaKg,
    visceralDelta,
    fatPoints,
    leanPoints,
    visceralPoints,
    total: fatPoints + leanPoints + visceralPoints,
  };
}

export type OverviewEntry = {
  member: Member;
  latest: Scan;
  previous?: Scan;
  height: number;
  ffmi: number;
  /** Composition breakdown, shown as context. Not what the form board ranks on. */
  condition: Condition;
  /** Rank on the form board, by the scale's own health score. */
  conditionRank: number;
  /** Progress since the previous weigh-in, absent during the baseline period. */
  progress: ProgressBreakdown | null;
  /** Rank on the progress board, absent until there is progress to rank. */
  progressRank: number | null;
};

/** Every member with their latest numbers, ranked on both boards. */
export function overviewBoard(): OverviewEntry[] {
  const rows = getMembers().flatMap((member) => {
    const scans = getScans(member.id);
    const latest = scans.at(-1);
    if (!latest) return [];

    const previous = scans.at(-2);
    const height = heightFor(scans);

    return [
      {
        member,
        latest,
        previous,
        height,
        ffmi: ffmi(latest, height),
        condition: conditionOf(latest, scans, member.sex),
        progress: previous
          ? progressBetween(previous, latest, member.goal)
          : null,
      },
    ];
  });

  const conditionRanks = new Map(
    [...rows]
      .sort((a, b) => b.latest.score - a.latest.score)
      .map((row, i) => [row.member.id, i + 1]),
  );

  const hasProgress = rows.some((r) => r.progress);
  const progressRanks = new Map(
    hasProgress
      ? [...rows]
          .sort((a, b) => (b.progress?.total ?? 0) - (a.progress?.total ?? 0))
          .map((row, i) => [row.member.id, i + 1] as const)
      : [],
  );

  return rows
    .map((row) => ({
      ...row,
      conditionRank: conditionRanks.get(row.member.id) ?? 0,
      progressRank: progressRanks.get(row.member.id) ?? null,
    }))
    .sort((a, b) =>
      hasProgress
        ? (a.progressRank ?? 0) - (b.progressRank ?? 0)
        : a.conditionRank - b.conditionRank,
    );
}

/** True once at least one member has two weigh-ins to compare. */
export function hasProgressData(): boolean {
  return overviewBoard().some((e) => e.progress);
}
