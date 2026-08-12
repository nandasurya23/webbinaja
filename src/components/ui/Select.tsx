'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaretDown, Check } from '@phosphor-icons/react/dist/ssr';
import { cn } from './Button';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onValueChange, options, placeholder = 'Select an option', className, disabled }: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find((opt) => opt.value === value);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100",
          "transition-all duration-200 hover:border-white/20",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "border-blue-500/50 ring-2 ring-blue-500/30"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-zinc-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown
          size={16}
          weight="bold"
          className={cn("text-zinc-500 transition-transform duration-200", isOpen && "rotate-180 text-blue-500")}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-xl backdrop-blur-xl"
          >
            <div className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none transition-colors",
                    "hover:bg-zinc-800 focus:bg-zinc-800",
                    value === option.value ? "text-blue-400 font-medium bg-blue-500/10" : "text-zinc-200"
                  )}
                >
                  {value === option.value && (
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check size={14} weight="bold" />
                    </span>
                  )}
                  <span className="flex flex-col items-start gap-0.5 text-left">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-zinc-500 font-normal">{option.description}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
