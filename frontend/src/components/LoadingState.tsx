export function LoadingState() {
  return (
    <div className="space-y-0" aria-label="Loading tasks" role="status">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-3 sm:py-4 border-b border-border"
        >
          <div className="w-5 h-5 rounded-full bg-border animate-pulse" />
          <div
            className="h-4 bg-border animate-pulse rounded"
            style={{ width: `${50 + i * 10}%` }}
          />
        </div>
      ))}
    </div>
  )
}
