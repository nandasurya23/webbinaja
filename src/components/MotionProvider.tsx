'use client';

import { LazyMotion, domAnimation } from 'motion/react';

// Every template only uses `initial`/`whileInView`/`animate` fades & slides —
// no drag, layout, or exit animations — so `domAnimation` (not the larger
// `domMax`) covers everything. Paired with `m.*` components (instead of
// `motion.*`) across templates, this loads only the animation engine that's
// actually used instead of the full motion feature set on every page.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
