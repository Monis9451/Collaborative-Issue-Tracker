'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SlideOverProps {
  open:     boolean
  onClose:  () => void
  title?:   string
  /** Width class — defaults to max-w-xl */
  width?:   string
  children: React.ReactNode
}

export function SlideOver({
  open,
  onClose,
  title,
  width = 'max-w-xl',
  children,
}: SlideOverProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const panelRef = useRef<HTMLDivElement>(null)

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-40 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={title ?? 'Detail panel'}
        >
          {/* ── Backdrop ─────────────────────────────────────── */}
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-bg-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* ── Panel ────────────────────────────────────────── */}
          <motion.div
            key="panel"
            ref={panelRef}
            className={cn(
              'relative z-10 flex h-full w-full flex-col bg-surface shadow-modal',
              width,
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            {title && (
              <div className="flex h-14 shrink-0 items-center justify-between
                              border-b border-border px-5">
                <h2 className="text-sm font-semibold text-text-primary truncate">
                  {title}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="flex h-7 w-7 items-center justify-center rounded-full
                             text-text-muted transition-colors hover:bg-gray-100
                             hover:text-text-primary cursor-pointer"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
