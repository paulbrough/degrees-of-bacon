import { SkeletonPulse } from "@/components/Skeleton";

export default function EpisodeCastLoading() {
  return (
    <div>
      {/* Mini header */}
      <div className="mb-6 flex items-center gap-3">
        <SkeletonPulse className="h-[69px] w-[46px] rounded" />
        <div>
          <SkeletonPulse className="h-6 w-48" />
          <SkeletonPulse className="mt-1 h-4 w-24" />
        </div>
      </div>

      {/* Tab pills */}
      <div className="mb-4 flex gap-2">
        <SkeletonPulse className="h-8 w-20 rounded-full" />
        <SkeletonPulse className="h-8 w-28 rounded-full" />
        <SkeletonPulse className="h-8 w-20 rounded-full" />
        <SkeletonPulse className="ml-2 h-8 w-32 rounded-lg" />
      </div>

      {/* List rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <SkeletonPulse className="h-[75px] w-[50px] shrink-0 rounded" />
            <div className="flex-1">
              <SkeletonPulse className="h-5 w-40" />
              <SkeletonPulse className="mt-1 h-4 w-56" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
