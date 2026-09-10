import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OverviewEntry } from "@/lib/rankings";
import { cn } from "@/lib/utils";

function signed(value: number, unit: string, digits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}${unit}`;
}

/** Who moved the most since the last weigh-in, scored against each member's goal. */
export function ProgressBoard({ entries }: { entries: OverviewEntry[] }) {
  const board = entries
    .filter((e) => e.progress)
    .sort((a, b) => (a.progressRank ?? 0) - (b.progressRank ?? 0));

  return (
    <Card>
      <CardContent className="px-0">
        <ul>
          {board.map((entry, i) => (
            <li key={entry.member.id}>
              {i > 0 && <Separator />}
              <Link
                href={`/${entry.member.id}`}
                className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-muted/50"
              >
                <span
                  className={cn(
                    "w-5 font-mono text-sm tabular-nums",
                    entry.progressRank === 1
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {entry.progressRank}
                </span>
                <span className="flex-1 text-sm font-medium">
                  {entry.member.name}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {signed(entry.progress?.fatDeltaKg ?? 0, "kg fat")}{" "}
                  {signed(entry.progress?.leanDeltaKg ?? 0, "kg lean")}
                </span>
                <span className="w-16 text-right font-mono text-sm tabular-nums">
                  {signed(entry.progress?.total ?? 0, " pts")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
