import Link from 'next/link';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';

// Plain <Link>s to ?page=N — a normal server-rendered navigation per click,
// not a client-side fetch loop. Next.js prefetches these links in the
// background on hover/viewport-entry same as any other <Link>, which is the
// framework's standard behavior, not extra "aggressive" fetching on our part.
export default function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(p: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== 'page' && value) params.set(key, value);
    }
    params.set('page', String(p));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between mt-6 text-sm">
      <span className="text-neutral-500 dark:text-neutral-400">
        Halaman {page} dari {totalPages} · {total} total
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <CaretLeft size={12} />
            Sebelumnya
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 dark:text-neutral-700 cursor-not-allowed">
            <CaretLeft size={12} />
            Sebelumnya
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Berikutnya
            <CaretRight size={12} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 dark:text-neutral-700 cursor-not-allowed">
            Berikutnya
            <CaretRight size={12} />
          </span>
        )}
      </div>
    </div>
  );
}
