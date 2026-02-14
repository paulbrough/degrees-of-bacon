import { SkeletonPulse, SkeletonText } from "@/components/Skeleton";

export default function PersonLoading() {
  return (
    <div>
      {/* Profile Header */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row">
        <SkeletonPulse className="aspect-[2/3] w-[200px] shrink-0 rounded-lg" />
        <div className="flex flex-1 flex-col gap-3">
          <SkeletonPulse className="h-9 w-56" />
          <div className="flex gap-3">
            <SkeletonPulse className="h-7 w-20 rounded-full" />
            <SkeletonPulse className="h-5 w-40" />
          </div>
          <SkeletonText lines={4} className="max-w-2xl" />
        </div>
      </div>

      {/* Prediction button placeholder */}
      <SkeletonPulse className="mb-8 h-10 w-64 rounded-lg" />

      {/* Filmography */}
      <SkeletonPulse className="mb-4 h-6 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2">
            <SkeletonPulse className="h-14 w-10 shrink-0 rounded" />
            <div className="flex-1">
              <SkeletonPulse className="h-4 w-48" />
              <SkeletonPulse className="mt-1 h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
