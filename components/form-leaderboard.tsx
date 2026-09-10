import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PILLAR_WEIGHTS } from "@/lib/condition";
import { GOAL_WEIGHTS, type OverviewEntry } from "@/lib/rankings";
import { cn } from "@/lib/utils";

const PILLARS = [
  { key: "leanness", label: "Lean" },
  { key: "muscle", label: "Muscle" },
  { key: "visceral", label: "Health" },
] as const;

/**
 * Who is in the best shape right now, from the latest scan alone. Three
 * components with published weights, so anyone can see why they placed.
 */
export function FormLeaderboard({ entries }: { entries: OverviewEntry[] }) {
  const board = [...entries].sort((a, b) => a.conditionRank - b.conditionRank);

  return (
    <Card>
      <CardContent className="px-0">
        <ul>
          {board.map((entry, i) => (
            <li key={entry.member.id}>
              {i > 0 && <Separator />}
              <Link
                href={`/${entry.member.id}`}
                className="block px-6 py-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-baseline gap-x-3">
                  <span
                    className={cn(
                      "w-5 font-mono text-xl tabular-nums",
                      entry.conditionRank === 1
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {entry.conditionRank}
                  </span>
                  <span className="text-xl font-semibold tracking-tight">
                    {entry.member.name}
                  </span>
                  <span className="flex-1 text-xs text-muted-foreground">
                    {GOAL_WEIGHTS[entry.member.goal].label}
                  </span>
                  <span className="font-mono text-xl tabular-nums">
                    {entry.condition.total.toFixed(1)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 pl-8 font-mono text-xs tabular-nums text-muted-foreground">
                  <span>{entry.latest.weight.toFixed(1)}kg</span>
                  <span>{entry.latest.fatMass.toFixed(1)}kg fat</span>
                  <span>{entry.latest.leanMass.toFixed(1)}kg lean</span>
                  <span>{entry.latest.bodyFatRate.toFixed(1)}% bf</span>
                  <span>FFMI {entry.ffmi.toFixed(1)}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3 pl-8">
                  {PILLARS.map((pillar) => (
                    <span key={pillar.key} className="block">
                      <span className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">
                          {pillar.label}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {entry.condition[pillar.key].toFixed(0)}
                        </span>
                      </span>
                      <span className="mt-1 block h-1 w-full bg-muted">
                        <span
                          className="block h-full bg-foreground/60"
                          style={{
                            width: `${entry.condition[pillar.key]}%`,
                          }}
                        />
                      </span>
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
      <Separator />
      <div className="px-6 pt-1 text-xs/relaxed text-muted-foreground">
        <span className="text-foreground">Score</span> is these three combined:{" "}
        {`Lean is body fat rate at ${PILLAR_WEIGHTS.leanness * 100}%, Muscle is
        FFMI at ${PILLAR_WEIGHTS.muscle * 100}%, Health is visceral fat at ${
          PILLAR_WEIGHTS.visceral * 100
        }%.`}
      </div>
    </Card>
  );
}
