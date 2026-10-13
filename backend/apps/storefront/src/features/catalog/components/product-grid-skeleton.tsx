export function ProductGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="h-4 w-24 animate-pulse rounded bg-foreground/[0.06]" />
        <div className="h-9 w-40 animate-pulse rounded bg-foreground/[0.06]" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square animate-pulse rounded-md bg-foreground/[0.06]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-foreground/[0.06]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-foreground/[0.06]" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-foreground/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}
