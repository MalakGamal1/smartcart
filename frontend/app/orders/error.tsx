"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Could not load orders.</p>
      <Button onClick={() => reset()}>Retry</Button>
    </div>
  );
}
