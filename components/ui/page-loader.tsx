'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Spinner } from '@/components/ui/spinner'

/**
 * Full-page loading overlay.
 *
 * Two variants:
 *  - "overlay"  → fixed position, covers the entire viewport with a
 *                 semi-transparent backdrop. Used when navigating between
 *                 routes while the current page is still visible underneath.
 *  - "screen"   → full viewport replacement (no content behind it).
 *                 Used by Next.js loading.tsx files.
 *
 * Usage:
 *   <PageLoader />                  — full screen, no message
 *   <PageLoader message="Signing in…" />
 *   <PageLoader variant="overlay" />
 */

interface PageLoaderProps {
  message?: string
  variant?: 'screen' | 'overlay'
}

export function PageLoader({ message, variant = 'screen' }: PageLoaderProps) {
  const isOverlay = variant === 'overlay'

  return (
    <AnimatePresence>
      <motion.div
        key="page-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={
          isOverlay
            ? // Overlay: transparent dark backdrop, sits on top
              'fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-overlay backdrop-blur-sm'
            : // Screen: replaces the entire viewport, matches page bg
              'fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-base'
        }
        aria-live="polite"
        aria-busy="true"
      >
        {/* App logo / wordmark above spinner */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-8 flex items-center gap-2"
        >
          {/* Simple inline SVG logo mark — replace with your actual logo later */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="32" height="32" rx="8" fill="#0052CC" />
            <path
              d="M8 22L14 10L20 22M11 18H17"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className={
              isOverlay
                ? 'text-lg font-bold text-text-inverse'
                : 'text-lg font-bold text-text-primary'
            }
          >
            IssueTracker
          </span>
        </motion.div>

        {/* The three-body spinner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3, type: 'spring', stiffness: 200 }}
        >
          <Spinner size="xl" />
        </motion.div>

        {/* Optional loading message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className={
              isOverlay
                ? 'mt-6 text-sm font-medium text-text-inverse'
                : 'mt-6 text-sm font-medium text-text-secondary'
            }
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
