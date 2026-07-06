// components/home-skeleton.tsx
export function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* carousel skeleton */}
      <div className="border-b border-hairline">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <div className="h-3 w-32 rounded bg-hairline" />
            <div className="h-10 w-3/4 rounded bg-hairline" />
            <div className="h-4 w-full rounded bg-hairline" />
            <div className="h-4 w-2/3 rounded bg-hairline" />
            <div className="h-10 w-40 rounded-full bg-hairline" />
          </div>
          <div className="mx-auto aspect-2/3 w-48 rounded-xl bg-hairline sm:w-60" />
        </div>
      </div>

      {/* genre chips skeleton */}
      <div className="border-b border-hairline">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-4 sm:px-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 w-20 shrink-0 rounded-full bg-hairline" />
          ))}
        </div>
      </div>

      {/* rail skeletons */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="mb-3 h-6 w-48 rounded bg-hairline" />
          <div className="flex gap-4 overflow-x-hidden">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="w-32 shrink-0 space-y-2 sm:w-40">
                <div className="aspect-2/3 w-full rounded-lg bg-hairline" />
                <div className="h-3 w-3/4 rounded bg-hairline" />
                <div className="h-3 w-1/2 rounded bg-hairline" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}