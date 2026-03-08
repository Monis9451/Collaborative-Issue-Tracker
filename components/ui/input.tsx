import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
//  Input — Jira-styled text input primitive.
//  Passes all native <input> props through.
//  hasError: applies red border + background for validation states.
// ─────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          // Base
          'block w-full rounded-[var(--radius-md)] px-3 py-2',
          'text-sm text-text-primary placeholder:text-text-muted',
          'bg-surface',
          'transition-colors duration-150',
          // Border
          'border',
          hasError
            ? 'border-danger bg-danger-light/30 focus:border-danger focus:ring-1 focus:ring-danger/30'
            : 'border-border focus:border-jira-blue focus:ring-2 focus:ring-jira-blue-light',
          // Focus ring — override browser default
          'outline-none',
          // Disabled
          'disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
