import { SkeletonRow } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </div>
  );
}
