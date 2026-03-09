import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'


const variants = {
  primary:
    'bg-jira-blue text-white hover:bg-jira-blue-hover active:bg-jira-blue-dark ' +
    'disabled:bg-jira-blue/50 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-jira-blue hover:bg-jira-blue-light ' +
    'disabled:text-text-muted disabled:cursor-not-allowed',
  outline:
    'bg-surface border border-border text-text-primary hover:bg-bg ' +
    'disabled:text-text-muted disabled:cursor-not-allowed',
  danger:
    'bg-danger text-white hover:bg-danger/90 ' +
    'disabled:bg-danger/50 disabled:cursor-not-allowed',
} as const

const sizes = {
  sm: 'h-8  px-3 text-sm  rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-sm  rounded-[var(--radius-md)]',
  lg: 'h-11 px-5 text-base rounded-[var(--radius-lg)]',
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   keyof typeof variants
  size?:      keyof typeof sizes
  isLoading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant    = 'primary',
      size       = 'md',
      isLoading  = false,
      fullWidth  = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-semibold leading-none',
          'transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-2',
          // Variant + size
          variants[variant],
          sizes[size],
          // Optional full-width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
