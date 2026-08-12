"use client";
import React from 'react';
import { m, HTMLMotionProps } from 'motion/react';

type AnimatedContainerProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "a" | "span" | "button";
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
};

export function AnimatedContainer({ children, as = "div", ...props }: AnimatedContainerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = m[as as keyof typeof m] as any;
  return <Component {...props}>{children}</Component>;
}
