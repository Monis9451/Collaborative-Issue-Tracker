'use client'

import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?:      SpinnerSize
  className?: string
  /** Accessible label for screen readers */
  label?:     string
}

const sizeClass: Record<SpinnerSize, string> = {
  sm: 'three-body--sm',
  md: '',              // default, no modifier needed
  lg: 'three-body--lg',
  xl: 'three-body--xl',
}

export function Spinner({ size = 'md', className, label = 'Loading…' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span className={cn('three-body', sizeClass[size])}>
        <span className="three-body__dot" />
        <span className="three-body__dot" />
        <span className="three-body__dot" />
      </span>
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </span>
  )
}
