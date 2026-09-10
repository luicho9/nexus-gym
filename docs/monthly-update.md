# Monthly update

Luicho pastes the scale reports as images once a month. Everything below happens
in that session.

## 1. Transcribe

For each report, append one object to `scans` in `data/measurements.json`. Read
every value off the image. Do not compute anything that is printed.

Field names map to the report labels:

| Report label       | Field              |
| ------------------ | ------------------ |
| Weight             | `weight`           |
| BMI                | `bmi`              |
| Body Fat Rate      | `bodyFatRate`      |
| Muscle Mass        | `muscleMass`       |
| Fat Mass           | `fatMass`          |
| Body Fat Index     | `bodyFatIndex`     |
| Obesity Level      | `obesityLevel`     |
| Ideal Weight       | `idealWeight`      |
| Weight Control     | `weightControl`    |
| Visceral Fat Index | `visceralFatIndex` |
| Weight without Fat | `leanMass`         |
| Body Water         | `bodyWater`        |
| Bone Mass          | `boneMass`         |
| Protein Rate       | `proteinRate`      |
| BMR                | `bmr`              |
| Metabolic Age      | `metabolicAge`     |
| Score              | `score`            |

`measuredAt` is the timestamp under the member's name, as local ISO with no
timezone. The status badges on the report are not stored, they are recomputed
from thresholds in `lib/metrics.ts`.

Two things that vary between reports:

- **Units.** Some reports print masses in pounds. Convert every mass to kg on
  the way in (`lb * 0.45359237`) and set `sourceUnit: "lb"` on the scan.
  Percentages, BMI, BMR and indexes are unitless and never converted.
- **Sex.** The body type chart gives it away: the female version has a body fat
  axis around 20/23/34/39 and is labelled Beauty Type and wasting type, the male
  one runs 10/15/21/26 with Athletic Type and Slim Type. Set `sex` on the
  member. Body fat, FFMI and body water are all scored against different bands
  per sex, so getting this wrong badly distorts someone's score.

**Check before moving on:** `fatMass + leanMass` must equal `weight` to within
0.1kg. If it does not, a number was misread.

Some reports are titled with an email address rather than a name. Use a short
display name and confirm it with Luicho rather than guessing silently.

## 2. Confirm goals

Each member has a `goal` of `cut`, `recomp` or `gain`, which decides how their
points are scored. Ask Luicho whether any goals changed. A goal change applies
to the month ahead, never retroactively to a month already scored.

## 3. Write the analysis

Add an `analysis` object to each new scan with a `summary` and
`recommendations`. This is the part that cannot be computed, so it is worth real
effort. What makes it useful:

- Compare against that member's own previous scan, not against the group.
- Say what actually changed and whether it matched their goal.
- Call out where the scale's own advice is misleading. Its `idealWeight` and
  `weightControl` are BMI derived and routinely tell muscular members to lose
  lean mass.
- Recommendations are concrete and few. Four is plenty.
- No medical claims or diagnoses. This is training feedback among friends.

Useful derived numbers, all in `lib/metrics.ts` and `lib/condition.ts`:

- height, recovered as `sqrt(weight / bmi)` since the report never prints it
- FFMI, `leanMass / height²`, how much muscle they carry for their frame
- goal weight at a target body fat, `leanMass / (1 - targetBodyFat)`

## 4. Verify

```
pnpm lint && pnpm build
```

Then read the home page and confirm the new numbers and ranks look right.
