'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MessageSquare, Calendar, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TicketPriorityBadge } from '@/components/dashboard/tickets/TicketPriorityBadge'
import type { TicketWithProfiles } from '@/types/database'
import { format } from 'date-fns'

// ─────────────────────────────────────────────────────────────
//  KanbanCardBody — pure visual card, no DnD wiring.
//  Used both by KanbanCard (with DnD) and by DragOverlay (ghost).
// ─────────────────────────────────────────────────────────────

interface KanbanCardBodyProps {
  ticket:     TicketWithProfiles
  isDragging?: boolean
  className?: string
}

export function KanbanCardBody({ ticket, isDragging, className }: KanbanCardBodyProps) {
  const assigneeInitials = ticket.assignee?.full_name
    ? ticket.assignee.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : ticket.assignee?.email?.[0]?.toUpperCase()

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
      {/* Mobile drag handle — visible only on touch screens */}
      <div className="md:hidden flex items-center justify-end -mt-1 mb-1">
        <GripVertical className="h-3.5 w-3.5 text-text-muted/50" strokeWidth={1.8} />
      </div>

      {/* Title */}
      <p className="mb-2 text-sm font-medium text-text-primary line-clamp-2 leading-snug">
        {ticket.title}
      </p>

      {/* Footer row */}
      <div className="flex items-center gap-2 flex-wrap">
        <TicketPriorityBadge priority={ticket.priority} />

        {/* Due date */}
        {ticket.due_date && (
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <Calendar className="h-3 w-3" strokeWidth={1.8} />
            {format(new Date(ticket.due_date), 'dd MMM')}
          </span>
        )}

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
  ticket:  TicketWithProfiles
  onClick: (ticket: TicketWithProfiles) => void
}

export function KanbanCard({ ticket, onClick }: KanbanCardProps) {
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
    // Hide the original card while dragging (DragOverlay takes its place)
    opacity: isDragging ? 0 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(ticket)}
    >
      <KanbanCardBody ticket={ticket} />
    </div>
  )
}
