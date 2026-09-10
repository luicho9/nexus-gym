import { deltaIsGood, formatDelta, type MetricDef } from "@/lib/metrics";
import { cn } from "@/lib/utils";

/** A signed change, coloured by whether it moved the right way for this metric. */
export function Delta({
  def,
  value,
  className,
}: {
  def: MetricDef;
  value: number;
  className?: string;
}) {
  const good = deltaIsGood(def, value);
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        good === null && "text-muted-foreground",
        good === true && "text-success",
        good === false && "text-caution",
        className,
      )}
    >
      {formatDelta(def, value)}
    </span>
  );
}
