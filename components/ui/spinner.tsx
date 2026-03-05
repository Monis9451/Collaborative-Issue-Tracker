'use client'

import { cn } from '@/lib/utils'

/**
 * Three-body orbital spinner — matches the Jira brand blue theme.
 *
 * Animation lives in globals.css (.three-body keyframes).
 * Size is controlled via a modifier class:
 *   sm  → 22px   (button inline loaders)
 *   md  → 35px   (default, card-level loaders)
 *   lg  → 52px   (section loaders)
 *   xl  → 70px   (full-page overlay)
 *
 * Usage:
 *   <Spinner />              — default 35px
 *   <Spinner size="sm" />    — small for inside buttons
 *   <Spinner size="xl" />    — large for page loaders
 *   <Spinner className="..." /> — override positioning
 */

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
