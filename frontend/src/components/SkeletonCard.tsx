export function SkeletonCard() {
  return (
    <div className="animate-pulse border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="flex gap-2">
            <div className="h-3 bg-gray-200 rounded w-12" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
