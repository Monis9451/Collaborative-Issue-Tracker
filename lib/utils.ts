import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  dateStr: string | null | undefined,
  options: { relative?: boolean } = {}
): string {
  if (!dateStr) return '—'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'

  if (options.relative) {
    const diffMs   = Date.now() - date.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHrs  = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1)   return 'just now'
    if (diffMins < 60)  return `${diffMins}m ago`
    if (diffHrs  < 24)  return `${diffHrs}h ago`
    if (diffDays < 7)   return `${diffDays}d ago`
    if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${Math.floor(diffDays / 365)}y ago`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  })
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars
    .replace(/[\s_-]+/g, '-')   // spaces/underscores → hyphens
    .replace(/^-+|-+$/g, '')    // trim leading/trailing hyphens
}

// ── Label maps ─────────────────────────────────────────────────

export const statusLabel = {
  open:        'Open',
  in_progress: 'In Progress',
  closed:      'Closed',
} as const

export const priorityLabel = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
} as const

// Tailwind class maps — used by <Badge> and Kanban column headers
export const statusClasses = {
  open: {
    bg:     'bg-status-open-bg',
    text:   'text-status-open-text',
    border: 'border-status-open-border',
    dot:    'bg-brand-600',
  },
  in_progress: {
    bg:     'bg-status-progress-bg',
    text:   'text-status-progress-text',
    border: 'border-status-progress-border',
    dot:    'bg-priority-medium',
  },
  closed: {
    bg:     'bg-status-closed-bg',
    text:   'text-status-closed-text',
    border: 'border-status-closed-border',
    dot:    'bg-priority-low',
  },
} as const

export const priorityClasses = {
  low:    { dot: 'bg-priority-low',    text: 'text-priority-low' },
  medium: { dot: 'bg-priority-medium', text: 'text-priority-medium' },
  high:   { dot: 'bg-priority-high',   text: 'text-priority-high' },
} as const
