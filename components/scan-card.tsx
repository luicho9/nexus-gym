import { Delta } from "@/components/delta";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMetric, METRICS } from "@/lib/metrics";
import type { Scan, Sex } from "@/lib/types";

/** The full scale report for one weigh-in, with deltas against the previous one. */
export function ScanCard({
  scan,
  previous,
  sex,
}: {
  scan: Scan;
  previous?: Scan;
  sex: Sex;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Full report</CardTitle>
        <p className="text-sm text-muted-foreground">
          {new Date(scan.measuredAt).toLocaleString("en-US", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </CardHeader>
      <CardContent className="px-0">
        <ul>
          {METRICS.map((def, i) => {
            const value = scan[def.key];
            const status = def.status?.(value, sex) ?? "neutral";
            const delta = previous ? value - previous[def.key] : null;

            return (
              <li key={def.key}>
                {i > 0 && <Separator />}
                <div className="flex items-center gap-3 px-6 py-3">
                  <span className="flex-1 text-sm">{def.label}</span>
                  {delta !== null && delta !== 0 && (
                    <Delta def={def} value={delta} />
                  )}
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatMetric(def, value)}
                  </span>
                  <span className="w-16 shrink-0 text-right">
                    <StatusBadge status={status} />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
