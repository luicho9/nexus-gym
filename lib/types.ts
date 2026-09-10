/**
 * What this member is training for. Locked in before a weigh-in, it decides how
 * their progress is scored, so a bulker is not judged on the same axis as a
 * cutter.
 */
export type Goal = "cut" | "recomp" | "gain";

/**
 * Reference bands for body fat, lean mass and body water differ enough between
 * sexes that scoring everyone on male bands would be simply wrong. The scale
 * knows this too: its body type chart uses a different body fat axis.
 */
export type Sex = "male" | "female";

export type Member = {
  id: string;
  name: string;
  sex: Sex;
  goal: Goal;
};

/** Written by Claude when the month's scale reports are pasted in. */
export type Analysis = {
  summary: string;
  recommendations: string[];
};

/** One weigh-in, transcribed verbatim from a scale report. Nothing derived is stored here. */
export type Scan = {
  memberId: string;
  measuredAt: string;
  weight: number;
  bmi: number;
  bodyFatRate: number;
  muscleMass: number;
  fatMass: number;
  leanMass: number;
  bodyFatIndex: number;
  obesityLevel: number;
  visceralFatIndex: number;
  bodyWater: number;
  boneMass: number;
  proteinRate: number;
  bmr: number;
  metabolicAge: number;
  idealWeight: number;
  weightControl: number;
  score: number;
  /** Set when the report was printed in pounds and converted on the way in. */
  sourceUnit?: "lb";
  analysis?: Analysis;
};

export type Measurements = {
  members: Member[];
  scans: Scan[];
};

export type Status = "ideal" | "caution" | "alert" | "neutral";
