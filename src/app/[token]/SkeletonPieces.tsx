// Shared building blocks for every loading.tsx under /[token] — kept as
// simple presentational pieces (no logic) so each route's skeleton can be
// assembled to roughly match that page's real layout, which reads as much
// more responsive than a single generic spinner would.

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 ${className}`} />;
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SkeletonBlock className="h-9 w-9 rounded-full shrink-0" />
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <SkeletonBlock className="h-3.5 w-1/3" />
          <SkeletonBlock className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonBlock className="h-5 w-16 shrink-0" />
    </div>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8 flex flex-col gap-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} className={`h-3.5 ${i === 0 ? 'w-1/3' : i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
      ))}
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="flex flex-col gap-2 mb-10">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="h-8 w-1/2" />
      <SkeletonBlock className="h-3.5 w-2/3" />
    </div>
  );
}

export function SkeletonPageShell({
  children,
  maxWidth = 'max-w-3xl',
}: {
  children: React.ReactNode;
  /** Matches the real page's <main> width (max-w-2xl for single-column forms, max-w-3xl for lists) so the skeleton doesn't visibly resize once real content swaps in. */
  maxWidth?: 'max-w-2xl' | 'max-w-3xl';
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
      <main className={`${maxWidth} mx-auto px-4 py-16 sm:py-20`}>{children}</main>
    </div>
  );
}
