import { SkeletonPageShell, SkeletonPageHeader, SkeletonCard } from './SkeletonPieces';

export default function AdminLoading() {
  return (
    <SkeletonPageShell maxWidth="max-w-2xl">
      <SkeletonPageHeader />
      <SkeletonCard lines={5} />
    </SkeletonPageShell>
  );
}
