'use client'

import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open:         boolean
  onClose:      () => void
  title:        string
  description?: string
  size?:        'sm' | 'md' | 'lg'
  children:     ReactNode
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────────────── */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* ── Panel ────────────────────────────────────────── */}
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby={description ? 'modal-description' : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'fixed left-1/2 top-1/2 z-60 w-[calc(100%-2rem)]',
              '-translate-x-1/2 -translate-y-1/2',
              'rounded-2xl bg-white p-6 shadow-xl',
              sizeClass[size]
            )}
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="modal-title"
                  className="text-lg font-bold text-text-primary"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="mt-0.5 text-sm text-text-secondary"
                  >
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                           text-text-muted transition-colors hover:bg-gray-100 hover:text-text-primary
                           focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-1"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
