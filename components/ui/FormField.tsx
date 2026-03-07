import { type ReactNode } from 'react'
import { clsx } from 'clsx'

// ─────────────────────────────────────────────────────────────
//  FormField — composes label + input slot + inline error message.
//  Children should be a single Input (or Select/Textarea).
//  error: when truthy, renders the error message below the input.
// ─────────────────────────────────────────────────────────────

interface FormFieldProps {
  label:      string
  htmlFor?:   string
  error?:     string
  required?:  boolean
  hint?:      string
  children:   ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-text-primary"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1 text-xs font-medium text-danger"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}
