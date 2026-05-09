"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <p className="text-sm text-muted-foreground">Something went wrong loading your cart.</p>
      <Button onClick={() => reset()}>Retry</Button>
    </div>
  );
}
