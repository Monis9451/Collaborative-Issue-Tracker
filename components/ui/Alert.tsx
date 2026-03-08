import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
//  Alert — inline alert banner for error/success/info/warning states.
//  Used inside forms to surface API-level errors and success messages.
// ─────────────────────────────────────────────────────────────

const alertConfig = {
  error: {
    container: 'bg-danger-light border-danger/30 text-danger',
    icon:      AlertCircle,
  },
  success: {
    container: 'bg-success-light border-success/30 text-success',
    icon:      CheckCircle2,
  },
  warning: {
    container: 'bg-warning-light border-warning/30 text-warning',
    icon:      AlertCircle,
  },
  info: {
    container: 'bg-info-light border-info/30 text-info',
    icon:      Info,
  },
} as const

interface AlertProps {
  variant?:   keyof typeof alertConfig
  title?:     string
  children:   ReactNode
  className?: string
}

export function Alert({
  variant   = 'error',
  title,
  children,
  className,
}: AlertProps) {
  const { container, icon: Icon } = alertConfig[variant]

  return (
    <div
      role="alert"
      className={clsx(
        'flex gap-3 rounded-[var(--radius-md)] border px-4 py-3',
        container,
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="text-sm">
        {title && <p className="font-semibold">{title}</p>}
        <p className={clsx(title && 'mt-0.5 opacity-90')}>{children}</p>
      </div>
    </div>
  )
}
