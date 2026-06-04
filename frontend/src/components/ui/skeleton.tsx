import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      {...props}
    />
  );
}

// 1. Grid of cards loading placeholder for discovery feeds
export function ListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-4 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          {/* Cover image placeholder */}
          <Skeleton className="h-48 w-full rounded-lg" />
          
          <div className="space-y-2">
            {/* Category and date row */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Title placeholder */}
            <Skeleton className="h-6 w-3/4 mt-2" />

            {/* Excerpt paragraph lines */}
            <div className="space-y-1 mt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Author info footer */}
            <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 2. Structured placeholder matching the single post detail page layout
export function DetailsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button link placeholder */}
      <Skeleton className="h-5 w-24" />

      {/* Cover Image container */}
      <Skeleton className="h-[350px] w-full rounded-2xl" />

      <div className="space-y-4">
        {/* Category badge */}
        <Skeleton className="h-6 w-24 rounded-full" />

        {/* Title */}
        <Skeleton className="h-10 w-2/3" />

        {/* Author metadata bar */}
        <div className="flex items-center space-x-4 py-2 border-y border-white/10">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-24" />
          </div>
        </div>
      </div>

      {/* Article content block lines */}
      <div className="space-y-4 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export { Skeleton };
