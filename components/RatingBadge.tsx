export function RatingBadge({ rating, label }: { rating: number; label?: string }) {
  const color =
    rating >= 7
      ? "bg-green-600/20 text-green-400"
      : rating >= 5
        ? "bg-yellow-600/20 text-yellow-400"
        : "bg-red-600/20 text-red-400";

  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-sm font-medium ${color}`}>
      {label && <span className="text-xs opacity-70">{label}</span>}
      {rating.toFixed(1)}
    </span>
  );
}
