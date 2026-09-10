import { FormLeaderboard } from "@/components/form-leaderboard";
import { ProgressBoard } from "@/components/progress-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GOAL_WEIGHTS, hasProgressData, overviewBoard } from "@/lib/rankings";

export default function Home() {
  const entries = overviewBoard();
  const ranked = hasProgressData();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Nexus Gym</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {entries.length} members, last weigh-in{" "}
          {`${new Date(
            Math.max(...entries.map((e) => Date.parse(e.latest.measuredAt))),
          ).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.`}
        </p>
      </header>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Current form</h2>
          <span className="text-xs text-muted-foreground">
            {ranked
              ? "best shape right now"
              : "baseline, points start in October"}
          </span>
        </div>
        <FormLeaderboard entries={entries} />
      </section>

      {ranked && (
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-sm font-medium">Progress this month</h2>
            <span className="text-xs text-muted-foreground">
              ranked by points
            </span>
          </div>
          <ProgressBoard entries={entries} />
        </section>
      )}

      <section className="mt-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">How points work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Everyone is scored against their own goal, so a bulker and a
              cutter are not ranked on the same axis. Goals are set before a
              weigh-in, never after seeing the numbers.
            </p>
            <ul className="space-y-2">
              {Object.entries(GOAL_WEIGHTS).map(([goal, w]) => (
                <li key={goal} className="flex gap-3">
                  <span className="w-16 shrink-0 text-foreground">
                    {w.label}
                  </span>
                  <span className="font-mono text-xs/relaxed tabular-nums">
                    fat off +{w.fatLoss}/%, fat on -{w.fatGain}/%, lean on +
                    {w.leanGain}/kg, lean off -{w.leanLoss}/kg, visceral ±
                    {w.visceral}
                  </span>
                </li>
              ))}
            </ul>
            <p>
              Fat is scored as a percentage of your own starting fat mass, so
              body size does not decide the winner. Lean mass is scored in
              absolute kg, because a kilo of muscle is hard for everyone. The
              board resets every weigh-in.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
