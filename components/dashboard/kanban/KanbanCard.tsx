'use client'

import { useRef, useState, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MessageSquare, Calendar, MoreVertical, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TicketPriorityBadge } from '@/components/dashboard/tickets/TicketPriorityBadge'
import { useIsMobile } from '@/hooks/useIsMobile'
import type { TicketWithProfiles, TicketStatus } from '@/types/database'
import { format } from 'date-fns'

// ─────────────────────────────────────────────────────────────
//  Column display labels
// ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TicketStatus, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  closed:      'Closed',
}

const ALL_STATUSES: TicketStatus[] = ['open', 'in_progress', 'closed']

// ─────────────────────────────────────────────────────────────
//  KanbanCardBody — pure visual card, no DnD wiring.
//  Used both by KanbanCard (with DnD) and by DragOverlay (ghost).
// ─────────────────────────────────────────────────────────────

interface KanbanCardBodyProps {
  ticket:        TicketWithProfiles
  currentStatus?: TicketStatus
  onMoveStatus?: (ticketId: string, status: TicketStatus) => void
  isDragging?:   boolean
  className?:    string
}

export function KanbanCardBody({
  ticket,
  currentStatus,
  onMoveStatus,
  isDragging,
  className,
}: KanbanCardBodyProps) {
  const assigneeInitials = ticket.assignee?.full_name
    ? ticket.assignee.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : ticket.assignee?.email?.[0]?.toUpperCase()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const otherStatuses = currentStatus
    ? ALL_STATUSES.filter(s => s !== currentStatus)
    : []

  return (
    <div
      className={cn(
        'rounded-md border border-border bg-white p-3 select-none',
        'shadow-card',
        isDragging
          ? 'shadow-xl ring-2 ring-jira-blue/30 rotate-[1.5deg] cursor-grabbing'
          : 'hover:shadow-md cursor-grab',
        className,
      )}
    >
      {/* Title row — title + mobile 3-dot menu side by side */}
      <div className="flex items-start gap-2 mb-2">
        <p className="flex-1 text-sm font-medium text-text-primary line-clamp-2 leading-snug">
          {ticket.title}
        </p>

        {/* Mobile-only move menu */}
        {onMoveStatus && currentStatus && (
          <div ref={menuRef} className="relative md:hidden shrink-0">
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
              aria-label="Move ticket"
              className="flex h-6 w-6 items-center justify-center rounded
                         text-text-muted hover:bg-gray-100 hover:text-text-secondary
                         transition-colors cursor-pointer"
            >
              <MoreVertical className="h-4 w-4" strokeWidth={1.8} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-50 min-w-[140px] rounded-lg
                           border border-border bg-white shadow-modal py-1"
              >
                <p className="px-3 py-1 text-[10px] font-semibold uppercase
                              tracking-wider text-text-muted">
                  Move to
                </p>
                {otherStatuses.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      onMoveStatus(ticket.id, s)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm
                               text-text-primary hover:bg-gray-50 transition-colors
                               cursor-pointer"
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-2 flex-wrap">
        <TicketPriorityBadge priority={ticket.priority} />

        {/* Due date */}
        {ticket.due_date && (() => {
          const today    = new Date().toISOString().split('T')[0]
          const overdue  = ticket.status !== 'closed' && ticket.due_date <= today
          return (
            <span className={cn(
              'flex items-center gap-1 text-[11px]',
              overdue ? 'text-danger font-semibold' : 'text-text-muted',
            )}>
              {overdue
                ? <AlertCircle className="h-3 w-3" strokeWidth={2} />
                : <Calendar    className="h-3 w-3" strokeWidth={1.8} />}
              {format(new Date(ticket.due_date), 'dd MMM')}
              {overdue && (
                <span className="rounded-full bg-danger-light px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-danger">
                  Overdue
                </span>
              )}
            </span>
          )
        })()}

        {/* Push remaining right */}
        <span className="ml-auto flex items-center gap-1.5">
          {/* Comments count */}
          {ticket.comments_count > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-text-muted">
              <MessageSquare className="h-3 w-3" strokeWidth={1.8} />
              {ticket.comments_count}
            </span>
          )}

          {/* Assignee avatar */}
          {ticket.assignee && assigneeInitials && (
            <div
              title={ticket.assignee.full_name ?? ticket.assignee.email}
              className="flex h-5 w-5 items-center justify-center rounded-full
                         bg-jira-blue-light text-[9px] font-bold text-jira-blue"
            >
              {assigneeInitials}
            </div>
          )}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
//  KanbanCard — sortable wrapper around KanbanCardBody
// ─────────────────────────────────────────────────────────────

interface KanbanCardProps {
  ticket:        TicketWithProfiles
  currentStatus: TicketStatus
  onMoveStatus:  (ticketId: string, status: TicketStatus) => void
  onClick:       (ticket: TicketWithProfiles) => void
}

export function KanbanCard({ ticket, currentStatus, onMoveStatus, onClick }: KanbanCardProps) {
  const isMobile = useIsMobile()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id })

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // On mobile we skip DnD listeners entirely — 3-dot menu is used instead
      {...(isMobile ? {} : listeners)}
      onClick={() => onClick(ticket)}
    >
      <KanbanCardBody
        ticket={ticket}
        currentStatus={currentStatus}
        onMoveStatus={isMobile ? onMoveStatus : undefined}
      />
    </div>
  )
}
