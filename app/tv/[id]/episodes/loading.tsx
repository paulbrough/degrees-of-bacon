import { SkeletonPulse } from "@/components/Skeleton";

export default function TvEpisodesLoading() {
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

      {/* Season dropdown */}
      <div className="mb-4">
        <SkeletonPulse className="h-8 w-48 rounded-lg" />
      </div>

      {/* Season heading */}
      <SkeletonPulse className="mb-4 h-7 w-56" />

      {/* Episode rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            <SkeletonPulse className="aspect-video w-[120px] shrink-0 rounded sm:w-[160px]" />
            <div className="flex-1">
              <SkeletonPulse className="h-5 w-48" />
              <SkeletonPulse className="mt-1 h-4 w-32" />
              <SkeletonPulse className="mt-2 h-4 w-full" />
              <SkeletonPulse className="mt-1 h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
