'use client';

import { LazyMotion } from 'motion/react';

// Every template only uses `initial`/`whileInView`/`animate` fades & slides —
// no drag, layout, or exit animations — so `domAnimation` (not the larger
// `domMax`) covers everything. Paired with `m.*` components (instead of
// `motion.*`) across templates, this loads only the animation engine that's
// actually used instead of the full motion feature set on every page.
// We use a dynamic import for features so it is not bundled in the initial load.
const loadFeatures = () => import('motion/react').then(res => res.domAnimation);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
