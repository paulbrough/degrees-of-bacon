import { SkeletonPulse } from "@/components/Skeleton";

export default function EpisodeLoading() {
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

      {/* Still image */}
      <SkeletonPulse className="mx-auto mb-6 aspect-video max-w-3xl rounded-lg" />

      {/* Title + rating */}
      <div className="mb-2 flex items-center gap-3">
        <SkeletonPulse className="h-8 w-80" />
        <SkeletonPulse className="h-6 w-12 rounded" />
      </div>

      {/* Metadata */}
      <div className="mb-4 flex gap-4">
        <SkeletonPulse className="h-5 w-32" />
        <SkeletonPulse className="h-5 w-16" />
      </div>

      {/* Overview */}
      <div className="mb-8 max-w-2xl space-y-2">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-3/4" />
      </div>

      {/* Prev/Next nav */}
      <div className="mb-8 flex justify-between">
        <SkeletonPulse className="h-10 w-28 rounded-lg" />
        <SkeletonPulse className="h-10 w-28 rounded-lg" />
      </div>

      {/* Guest stars */}
      <SkeletonPulse className="mb-4 h-6 w-32" />
      <div className="flex gap-3 overflow-hidden pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[120px] shrink-0">
            <SkeletonPulse className="aspect-[2/3] w-full rounded-lg" />
            <SkeletonPulse className="mt-1.5 h-4 w-3/4" />
            <SkeletonPulse className="mt-1 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
