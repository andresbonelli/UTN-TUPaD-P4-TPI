interface SkeletonProps {
  count?: number
  variant?: 'cards' | 'rows'
}

export function Skeleton({ count = 6, variant = 'cards' }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, idx) => idx)

  if (variant === 'rows') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
        {items.map((idx) => (
          <div
            key={idx}
            className="h-12 bg-slate-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
        >
          <div className="h-44 bg-slate-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-9 w-28 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
