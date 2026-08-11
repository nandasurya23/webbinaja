import { SkeletonPageShell, SkeletonPageHeader, SkeletonCard, SkeletonBlock } from '../SkeletonPieces';

export default function ManageAdminsLoading() {
  return (
    <SkeletonPageShell maxWidth="max-w-2xl">
      <SkeletonBlock className="h-3 w-24 mb-6" />
      <SkeletonPageHeader />
      <div className="flex flex-col gap-8">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </div>
    </SkeletonPageShell>
  );
}
