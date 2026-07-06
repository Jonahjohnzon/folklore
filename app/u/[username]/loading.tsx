import React from 'react'

const ProfileSkeleton = () => {
  return (
       <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <div className="h-28 w-28 shrink-0 animate-pulse rounded-full bg-hairline" />

        <div className="mt-4 flex-1 sm:ml-6 sm:mt-0">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full">
              <div className="h-6 w-40 animate-pulse rounded bg-hairline sm:mx-0" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-hairline" />
            </div>
            <div className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-hairline" />
          </div>

          {/* bio */}
          <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-hairline" />

          {/* badge shelf */}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <div className="h-7 w-24 animate-pulse rounded-full bg-hairline" />
            <div className="h-7 w-28 animate-pulse rounded-full bg-hairline" />
            <div className="h-7 w-20 animate-pulse rounded-full bg-hairline" />
          </div>

          {/* joined date / website */}
          <div className="mt-3 flex justify-center gap-4 sm:justify-start">
            <div className="h-3.5 w-28 animate-pulse rounded bg-hairline" />
          </div>

          {/* stats row */}
          <div className="mt-4 flex justify-center gap-6 border-t border-hairline pt-4 sm:justify-start">
            <div>
              <div className="h-4 w-6 animate-pulse rounded bg-hairline" />
              <div className="mt-1.5 h-3 w-10 animate-pulse rounded bg-hairline" />
            </div>
            <div>
              <div className="h-4 w-6 animate-pulse rounded bg-hairline" />
              <div className="mt-1.5 h-3 w-14 animate-pulse rounded bg-hairline" />
            </div>
          </div>
        </div>
      </div>

      {/* works grid */}
      <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-2/3 animate-pulse rounded-lg bg-hairline" />
        ))}
      </div>
    </div>
  )
}



export default ProfileSkeleton

