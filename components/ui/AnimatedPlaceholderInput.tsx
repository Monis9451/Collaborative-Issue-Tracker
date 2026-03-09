'use client'

import {
  forwardRef,
  useState,
  useCallback,
  type FocusEvent,
  type ChangeEvent,
} from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input, type InputProps } from '@/components/ui/input'

export interface AnimatedPlaceholderInputProps extends InputProps {
  placeholder?: string
}

export const AnimatedPlaceholderInput = forwardRef<
  HTMLInputElement,
  AnimatedPlaceholderInputProps
>(
  (
    {
      placeholder,
      type,
      hasError = false,
      className,
      onFocus,
      onBlur,
      onChange,
      defaultValue,
      value,
      ...rest
    },
    ref
  ) => {
    const isPassword = type === 'password'

    const [focused,      setFocused]      = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [hasValue,     setHasValue]     = useState(
      !!(value ?? defaultValue) && String(value ?? defaultValue).length > 0
    )

    const hide = focused || hasValue

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => { setFocused(true); onFocus?.(e) },
      [onFocus]
    )
    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setFocused(false)
        setHasValue(e.target.value.length > 0)
        onBlur?.(e)
      },
      [onBlur]
    )
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setHasValue(e.target.value.length > 0)
        onChange?.(e)
      },
      [onChange]
    )
    
    return (
      <div className="relative">
        <div className="overflow-hidden rounded-full">
          {/* Animated placeholder — framer-motion compositor-smooth slide */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              x:       hide ? '-110%' : '0%',
              opacity: hide ? 0       : 1,
            }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 select-none text-sm text-text-muted"
          >
            {placeholder}
          </motion.span>

          <Input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            placeholder=""
            hasError={hasError}
            value={value}
            defaultValue={defaultValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            className={cn(
              'h-11 rounded-full bg-gray-50 px-5 text-sm',
              // extra right padding so text doesn't run under the eye icon
              isPassword && 'pr-11',
              className
            )}
            {...rest}
          />
        </div>

        {/* Eye toggle — outside overflow-hidden so it isn't clipped */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center
                       rounded-full text-text-muted transition-colors duration-150
                       hover:bg-gray-200 hover:text-text-primary
                       focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-1"
          >
            {showPassword
              ? <EyeOff className="h-4 w-4" strokeWidth={1.8} />
              : <Eye    className="h-4 w-4" strokeWidth={1.8} />
            }
          </button>
        )}
      </div>
    )
  }
)

AnimatedPlaceholderInput.displayName = 'AnimatedPlaceholderInput'
