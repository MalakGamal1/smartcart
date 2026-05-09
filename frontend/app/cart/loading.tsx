import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
