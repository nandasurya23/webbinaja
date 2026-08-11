import { SkeletonPageShell, SkeletonPageHeader, SkeletonListItem, SkeletonBlock } from '../SkeletonPieces';

export default function InboxLoading() {
  return (
    <SkeletonPageShell>
      <SkeletonPageHeader />
      <SkeletonBlock className="h-10 w-full mb-6" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </div>
    </SkeletonPageShell>
  );
}
