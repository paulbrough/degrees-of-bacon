import { SkeletonPulse, SkeletonText, SkeletonRow } from "@/components/Skeleton";

export default function TvLoading() {
  return (
    <div>
      {/* Hero */}
      <div className="relative -mx-4 -mt-8 mb-8 overflow-hidden bg-surface">
        <div className="flex gap-8 px-4 py-12 sm:px-8 sm:py-16">
          <SkeletonPulse className="hidden aspect-[2/3] w-[200px] shrink-0 rounded-lg sm:block" />
          <div className="flex flex-1 flex-col justify-end gap-3">
            <SkeletonPulse className="h-10 w-80 max-w-full" />
            <div className="flex gap-2">
              <SkeletonPulse className="h-7 w-20 rounded-full" />
              <SkeletonPulse className="h-7 w-24 rounded-full" />
            </div>
            <div className="flex gap-3">
              <SkeletonPulse className="h-8 w-16 rounded" />
              <SkeletonPulse className="h-8 w-16 rounded" />
            </div>
            <SkeletonText lines={3} className="max-w-2xl" />
          </div>
        </div>
      </div>

      {/* Cast */}
      <SkeletonPulse className="mb-3 h-6 w-24" />
      <div className="mb-8 flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-[120px] shrink-0">
            <SkeletonPulse className="aspect-[2/3] w-full rounded-lg" />
            <SkeletonPulse className="mt-2 h-4 w-3/4" />
            <SkeletonPulse className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <SkeletonRow />
    </div>
  );
}
