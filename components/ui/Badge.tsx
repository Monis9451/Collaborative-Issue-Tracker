import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
//  Badge — small colored label with variant support.
// ─────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'default'
  | 'blue'
  | 'green'
  | 'orange'
  | 'red'
  | 'gray'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-text-secondary',
  blue:    'bg-jira-blue-light text-jira-blue',
  green:   'bg-success-light text-success',
  orange:  'bg-warning-light text-warning',
  red:     'bg-danger-light text-danger',
  gray:    'bg-gray-100 text-text-muted',
}

interface BadgeProps {
  label:     string
  variant?:  BadgeVariant
  className?: string
  dot?:      boolean
}

export function Badge({ label, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide leading-none',
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      {label}
    </span>
  )
}
