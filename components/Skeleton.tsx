export function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="w-[180px] shrink-0">
      <SkeletonPulse className="aspect-[2/3] w-full rounded-lg" />
      <SkeletonPulse className="mt-2 h-4 w-3/4" />
      <SkeletonPulse className="mt-1 h-3 w-1/2" />
    </div>
  );
}

export function SkeletonRow({ count = 8 }: { count?: number }) {
  return (
    <div className="mb-10">
      <SkeletonPulse className="mb-4 h-6 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
