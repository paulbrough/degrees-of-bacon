import { SkeletonPulse, SkeletonRow } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-10 text-center">
        <SkeletonPulse className="mx-auto h-10 w-64" />
        <SkeletonPulse className="mx-auto mt-3 h-5 w-96 max-w-full" />
      </div>

      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
