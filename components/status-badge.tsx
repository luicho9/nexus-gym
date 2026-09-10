import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<Status, string> = {
  ideal: "Ideal",
  caution: "Watch",
  alert: "Alert",
  neutral: "",
};

const STYLES: Record<Status, string> = {
  ideal: "bg-success/15 text-success",
  caution: "bg-warning/20 text-warning-foreground dark:text-warning",
  alert: "bg-caution/15 text-caution",
  neutral: "",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  if (status === "neutral") return null;
  return (
    <Badge variant="ghost" className={cn(STYLES[status], className)}>
      {label ?? LABELS[status]}
    </Badge>
  );
}
