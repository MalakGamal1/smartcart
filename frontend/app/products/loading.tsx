import { SkeletonGrid } from "@/components/SkeletonGrid";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
      <div className="h-40 animate-pulse rounded-xl bg-muted" />
      <SkeletonGrid />
    </div>
  );
}
