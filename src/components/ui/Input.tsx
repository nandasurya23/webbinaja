import * as React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500/50 focus-visible:ring-red-500/30 focus-visible:border-red-500/50' : 'border-white/10',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
