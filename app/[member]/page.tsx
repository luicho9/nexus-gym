import Link from "next/link";
import { notFound } from "next/navigation";
import { ScanCard } from "@/components/scan-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { conditionOf } from "@/lib/condition";
import { getMember, getMembers, getScans } from "@/lib/data";
import { ffmi, heightFor } from "@/lib/metrics";
import { GOAL_WEIGHTS, progressBetween } from "@/lib/rankings";

export function generateStaticParams() {
  return getMembers().map((m) => ({ member: m.id }));
}

export default async function MemberPage({ params }: PageProps<"/[member]">) {
  const { member: id } = await params;
  const member = getMember(id);
  const scans = getScans(id);
  const latest = scans.at(-1);
  if (!member || !latest) notFound();

  const previous = scans.at(-2);
  const height = heightFor(scans);
  const condition = conditionOf(latest, scans, member.sex);
  const progress = previous
    ? progressBetween(previous, latest, member.goal)
    : null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-6">
        <Link href="/">← Overview</Link>
      </Button>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{member.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {GOAL_WEIGHTS[member.goal].label} · {height.toFixed(2)}m · FFMI{" "}
          {ffmi(latest, height).toFixed(1)} · {scans.length} weigh-in
          {scans.length === 1 ? "" : "s"}
        </p>
      </header>

      <div className="mb-8 grid grid-cols-4 gap-3">
        <Stat label="Form" value={condition.total.toFixed(1)} />
        <Stat label="Weight" value={`${latest.weight.toFixed(1)}kg`} />
        <Stat label="Fat mass" value={`${latest.fatMass.toFixed(1)}kg`} />
        <Stat label="Lean mass" value={`${latest.leanMass.toFixed(1)}kg`} />
      </div>

      {latest.analysis && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">What the numbers say</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm/relaxed text-muted-foreground">
              {latest.analysis.summary}
            </p>
            <ul className="space-y-2">
              {latest.analysis.recommendations.map((rec) => (
                <li
                  key={rec}
                  className="flex gap-3 text-sm/relaxed text-muted-foreground"
                >
                  <span className="text-primary">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {progress && (
        <Card className="mb-8">
          <CardContent className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              Progress this weigh-in
            </span>
            <span className="font-mono text-2xl tabular-nums">
              {progress.total > 0 ? "+" : ""}
              {progress.total.toFixed(1)}
              <span className="ml-1 text-sm text-muted-foreground">pts</span>
            </span>
          </CardContent>
        </Card>
      )}

      <ScanCard scan={latest} previous={previous} sex={member.sex} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-4">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="mt-1 block font-mono text-xl tabular-nums">
          {value}
        </span>
      </CardContent>
    </Card>
  );
}
