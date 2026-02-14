import { SkeletonPulse } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <div>
      <SkeletonPulse className="h-8 w-64" />

      {/* Top Result */}
      <div className="mt-6">
        <SkeletonPulse className="mb-3 h-4 w-24" />
        <div className="flex gap-6 rounded-xl bg-surface p-5">
          <SkeletonPulse className="hidden aspect-[2/3] w-[140px] shrink-0 rounded-lg sm:block" />
          <div className="flex flex-1 flex-col justify-center gap-3">
            <SkeletonPulse className="h-4 w-16 rounded" />
            <SkeletonPulse className="h-7 w-64 max-w-full" />
            <SkeletonPulse className="h-4 w-40" />
            <SkeletonPulse className="h-4 w-full max-w-md" />
            <SkeletonPulse className="h-4 w-3/4 max-w-sm" />
          </div>
        </div>
      </div>

      {/* Result list */}
      <div className="mt-8 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2">
            <SkeletonPulse className="h-16 w-11 shrink-0 rounded" />
            <div className="flex-1">
              <SkeletonPulse className="h-4 w-48" />
              <SkeletonPulse className="mt-1 h-3 w-32" />
            </div>
            <SkeletonPulse className="h-5 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
