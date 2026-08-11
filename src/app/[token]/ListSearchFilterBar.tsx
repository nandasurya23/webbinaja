'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  /** URL query param name, e.g. "workStatus". */
  param: string;
  /** Shown as the empty/"all" option. */
  allLabel: string;
  options: FilterOption[];
  /** Preselected value when the URL has no param yet (the page applies this same default server-side) — distinct from the "all" option, which is only reached by explicitly picking it. */
  defaultValue?: string;
}

// Search updates the URL only after the user stops typing (debounced) —
// each URL change triggers exactly one server request (Next re-renders the
// Server Component page with the new searchParams), never a request per
// keystroke. Filter dropdowns update immediately since a select's onChange
// is already a single discrete event, not a stream of them.
const SEARCH_DEBOUNCE_MS = 400;

export default function ListSearchFilterBar({
  searchPlaceholder,
  filters,
}: {
  searchPlaceholder: string;
  filters: FilterConfig[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keeps the input in sync if the URL changes from elsewhere (e.g. back/forward navigation).
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete('page'); // any search/filter change starts back at page 1
    router.push(`${pathname}?${params.toString()}`);
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam('q', value), SEARCH_DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const selectClass =
    'rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 pl-9 pr-3.5 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        />
      </div>
      {filters.map((f) => (
        <select
          key={f.param}
          defaultValue={searchParams.get(f.param) ?? f.defaultValue ?? ''}
          onChange={(e) => updateParam(f.param, e.target.value)}
          className={selectClass}
        >
          <option value="">{f.allLabel}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
