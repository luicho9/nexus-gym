import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Nexus Gym</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Badge>Design system ready</Badge>
          <Button size="sm">Button</Button>
        </CardContent>
      </Card>
    </main>
  );
}
