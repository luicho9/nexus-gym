import type { Scan, Sex, Status } from "./types";

/**
 * The reports never print height, but BMI is weight / height², so it is
 * recoverable from any single scan. Averaged across scans to smooth rounding.
 */
export function heightFor(scans: Scan[]): number {
  const heights = scans.map((s) => Math.sqrt(s.weight / s.bmi));
  return heights.reduce((a, b) => a + b, 0) / heights.length;
}

/**
 * Fat-free mass index: lean mass normalised by height, the way BMI normalises
 * total weight. Comparable across body sizes in a way raw muscle mass is not.
 */
export function ffmi(scan: Scan, height: number): number {
  return scan.leanMass / height ** 2;
}

export type MetricKey =
  | "bmi"
  | "bodyFatRate"
  | "muscleMass"
  | "fatMass"
  | "bodyFatIndex"
  | "obesityLevel"
  | "idealWeight"
  | "weightControl"
  | "visceralFatIndex"
  | "leanMass"
  | "bodyWater"
  | "boneMass"
  | "proteinRate"
  | "bmr"
  | "metabolicAge";

export type MetricDef = {
  key: MetricKey;
  label: string;
  unit: string;
  /** Decimal places for display. */
  precision: number;
  /** Which direction counts as improvement, for delta colouring. */
  better: "lower" | "higher" | "none";
  status?: (value: number, sex: Sex) => Status;
};

const band =
  (bands: Array<[max: number, status: Status]>, fallback: Status) =>
  (value: number): Status => {
    for (const [max, status] of bands) if (value < max) return status;
    return fallback;
  };

/** Picks a band set by sex, for the metrics where the reference range differs. */
const bySex =
  (
    male: (value: number) => Status,
    female: (value: number) => Status,
  ): ((value: number, sex: Sex) => Status) =>
  (value, sex) =>
    sex === "female" ? female(value) : male(value);

/**
 * Thresholds are the adult-male bands the scale itself appears to use, so they
 * reproduce the statuses printed on the September reports.
 */
export const METRICS: MetricDef[] = [
  {
    key: "bmi",
    label: "BMI",
    unit: "",
    precision: 1,
    better: "lower",
    status: band(
      [
        [18.5, "caution"],
        [24, "ideal"],
        [28, "caution"],
      ],
      "alert",
    ),
  },
  {
    key: "bodyFatRate",
    label: "Body Fat Rate",
    unit: "%",
    precision: 1,
    better: "lower",
    status: bySex(
      band(
        [
          [10, "caution"],
          [20, "ideal"],
          [27, "caution"],
        ],
        "alert",
      ),
      band(
        [
          [20, "caution"],
          [32, "ideal"],
          [40, "caution"],
        ],
        "alert",
      ),
    ),
  },
  {
    key: "muscleMass",
    label: "Muscle Mass",
    unit: "kg",
    precision: 1,
    better: "higher",
  },
  {
    key: "fatMass",
    label: "Fat Mass",
    unit: "kg",
    precision: 1,
    better: "lower",
  },
  {
    key: "bodyFatIndex",
    label: "Body Fat Index",
    unit: "",
    precision: 0,
    better: "lower",
  },
  {
    key: "obesityLevel",
    label: "Obesity Level",
    unit: "",
    precision: 0,
    better: "lower",
  },
  {
    key: "idealWeight",
    label: "Ideal Weight",
    unit: "kg",
    precision: 1,
    better: "none",
  },
  {
    key: "weightControl",
    label: "Weight Control",
    unit: "kg",
    precision: 1,
    better: "lower",
  },
  {
    key: "visceralFatIndex",
    label: "Visceral Fat Index",
    unit: "",
    precision: 0,
    better: "lower",
    status: band([[10, "ideal"]], "alert"),
  },
  {
    key: "leanMass",
    label: "Weight without Fat",
    unit: "kg",
    precision: 1,
    better: "higher",
  },
  {
    key: "bodyWater",
    label: "Body Water",
    unit: "%",
    precision: 1,
    better: "higher",
    status: bySex(
      band([[50, "caution"]], "ideal"),
      band([[45, "caution"]], "ideal"),
    ),
  },
  {
    key: "boneMass",
    label: "Bone Mass",
    unit: "kg",
    precision: 1,
    better: "none",
  },
  {
    key: "proteinRate",
    label: "Protein Rate",
    unit: "%",
    precision: 1,
    better: "higher",
    status: band([[16, "caution"]], "ideal"),
  },
  { key: "bmr", label: "BMR", unit: "kcal", precision: 0, better: "higher" },
  {
    key: "metabolicAge",
    label: "Metabolic Age",
    unit: "yrs",
    precision: 0,
    better: "lower",
  },
];

export function formatMetric(def: MetricDef, value: number): string {
  return `${value.toFixed(def.precision)}${def.unit}`;
}

export function formatDelta(def: MetricDef, delta: number): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${Math.abs(delta).toFixed(def.precision)}${def.unit}`;
}

/** Did this delta move in the good direction? `null` when the metric has no direction. */
export function deltaIsGood(def: MetricDef, delta: number): boolean | null {
  if (def.better === "none" || delta === 0) return null;
  return def.better === "lower" ? delta < 0 : delta > 0;
}
