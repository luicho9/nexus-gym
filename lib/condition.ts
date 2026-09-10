import { ffmi, heightFor } from "./metrics";
import type { Scan, Sex } from "./types";

/** Linear interpolation across a set of (input, score) anchor points. */
function curve(points: Array<[number, number]>, value: number): number {
  if (value <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (value >= last[0]) return last[1];

  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    if (value <= x1) return y0 + ((value - x0) / (x1 - x0)) * (y1 - y0);
  }
  return last[1];
}

/**
 * The three pillars of the condition score, each 0-100 against adult-male
 * reference bands.
 */
export const PILLARS = {
  /** Leanness. Female bands sit roughly 8 to 10 points higher throughout. */
  leanness: (bodyFatRate: number, sex: Sex) =>
    curve(
      sex === "female"
        ? [
            [20, 100],
            [28, 75],
            [32, 50],
            [38, 25],
            [48, 0],
          ]
        : [
            [12, 100],
            [20, 75],
            [25, 50],
            [30, 25],
            [40, 0],
          ],
      bodyFatRate,
    ),
  /** Muscularity, by FFMI so height is already accounted for. */
  muscle: (ffmiValue: number, sex: Sex) =>
    curve(
      sex === "female"
        ? [
            [14, 30],
            [18, 70],
            [20, 90],
            [22, 100],
          ]
        : [
            [17, 30],
            [21, 70],
            [23, 90],
            [25, 100],
          ],
      ffmiValue,
    ),
  /** Visceral fat, the one number here that is genuinely about health risk. */
  visceral: (visceralFatIndex: number) =>
    curve(
      [
        [1, 100],
        [9, 85],
        [14, 50],
        [25, 0],
      ],
      visceralFatIndex,
    ),
} as const;

export const PILLAR_WEIGHTS = {
  leanness: 0.45,
  muscle: 0.3,
  visceral: 0.25,
} as const;

export type Condition = {
  leanness: number;
  muscle: number;
  visceral: number;
  total: number;
};

/**
 * How well someone is doing right now, from a single scan. Unlike the scale's
 * own score this is transparent: three components, published weights, and it
 * does not punish you for carrying muscle the way anything BMI-based does.
 */
export function conditionOf(scan: Scan, scans: Scan[], sex: Sex): Condition {
  const height = heightFor(scans);
  const leanness = PILLARS.leanness(scan.bodyFatRate, sex);
  const muscle = PILLARS.muscle(ffmi(scan, height), sex);
  const visceral = PILLARS.visceral(scan.visceralFatIndex);

  return {
    leanness,
    muscle,
    visceral,
    total:
      leanness * PILLAR_WEIGHTS.leanness +
      muscle * PILLAR_WEIGHTS.muscle +
      visceral * PILLAR_WEIGHTS.visceral,
  };
}
