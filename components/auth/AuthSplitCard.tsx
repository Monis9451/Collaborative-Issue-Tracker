'use client'

import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
//  AuthSplitCard — split-panel auth card.
//
//  Layout:
//   ┌─────────────────────┬──────────────────┐
//   │  Left: Form Panel   │  Right: CTA Panel│  ctaPosition="right" (login)
//   └─────────────────────┴──────────────────┘
//
//   ┌──────────────────┬─────────────────────┐
//   │  Left: CTA Panel │  Right: Form Panel  │  ctaPosition="left" (register)
//   └──────────────────┴─────────────────────┘
//
//  - ctaPosition="right" → blue panel slides in from right (login)
//  - ctaPosition="left"  → blue panel slides in from left  (register)
//  - Blue panel: rounded corners on the form-facing edge, sharp on outer edge
//  - Right panel is hidden on mobile (form stacks full-width)
// ─────────────────────────────────────────────────────────────

interface AuthSplitCardProps {
  formTitle:      string
  ctaTitle:       string
  ctaSubtitle:    string
  ctaButtonLabel: string
  ctaButtonHref:  string
  ctaPosition?:   'left' | 'right'
  children:       ReactNode
}

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

function AppLogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-jira-blue shadow-sm">
      <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M16 8L22 12V20L16 24L10 20V12L16 8Z" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function AuthSplitCard({
  formTitle,
  ctaTitle,
  ctaSubtitle,
  ctaButtonLabel,
  ctaButtonHref,
  ctaPosition = 'right',
  children,
}: AuthSplitCardProps) {
  // Animate CTA from the side it lives on
  const ctaVariants: Variants = {
    hidden:  { opacity: 0, x: ctaPosition === 'right' ? 24 : -24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.22, duration: 0.45, ease: 'easeOut' as const },
    },
  }

  // Rounded corners on the edge that touches the form panel; sharp on outer edge
  const ctaPanelRadius =
    ctaPosition === 'right'
      ? 'rounded-tl-3xl rounded-bl-3xl rounded-tr-none rounded-br-none'
      : 'rounded-tr-3xl rounded-br-3xl rounded-tl-none rounded-bl-none'

  const ctaPanel = (
    <motion.div
      key={`cta-${ctaPosition}`}
      variants={ctaVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative hidden overflow-hidden',
        'md:flex md:w-[42%] md:flex-col md:items-center md:justify-center md:p-10',
        'bg-gradient-to-br from-jira-blue-dark via-jira-blue to-jira-blue-hover',
        ctaPosition === 'left' ? 'order-first' : 'order-last',
        ctaPanelRadius
      )}
    >
      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-sky-400/20 blur-2xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-xl" />

      {/* Glassmorphism inner card */}
      <div className="relative z-10 w-full rounded-2xl border border-white/20 bg-white/10 px-8 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md">
        <h2 className="mb-3 text-2xl font-extrabold leading-snug text-white">
          {ctaTitle}
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-white/75">
          {ctaSubtitle}
        </p>
        <Link
          href={ctaButtonHref}
          className="inline-flex h-10 items-center justify-center rounded-full border-2 border-white px-8
                     text-sm font-bold uppercase tracking-wider text-white
                     transition-all duration-200 hover:bg-white hover:text-jira-blue
                     focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          {ctaButtonLabel}
        </Link>
      </div>
    </motion.div>
  )

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
    >
      {/* ── Left: Form Panel ─────────────────────────────────── */}
      <div
        className={cn(
          'flex w-full flex-col px-10 py-12 md:w-[58%]',
          ctaPosition === 'left' ? 'order-last' : 'order-first'
        )}
      >
        <div className="mb-7 flex flex-col items-center gap-2.5">
          <AppLogoMark />
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
            {formTitle}
          </h1>
        </div>

        {children}

        {/* ── Mobile-only page switcher (CTA panel is hidden on mobile) ── */}
        <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
          <hr className="flex-1 border-border" />
          <span className="shrink-0 text-xs text-text-muted">or</span>
          <hr className="flex-1 border-border" />
        </div>
        <Link
          href={ctaButtonHref}
          className="mt-4 flex items-center justify-center text-sm font-bold uppercase tracking-wider text-jira-blue
                     transition-all duration-200 hover:bg-jira-blue hover:text-white
                     focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-2
                     md:hidden"
        >
          {ctaButtonLabel}
        </Link>
      </div>

      {ctaPanel}
    </motion.div>
  )
}

// ── Re-exported animation variants for child form fields ──────
export const fieldVariant: Variants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' as const } },
}

export const fieldContainerVariant: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

