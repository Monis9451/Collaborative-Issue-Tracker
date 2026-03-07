'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import { KanbanCard } from './KanbanCard'
import type { TicketWithProfiles, TicketStatus } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  Column config
// ─────────────────────────────────────────────────────────────

const columnConfig: Record<TicketStatus, { label: string; accentClass: string }> = {
  open:        { label: 'Open',        accentClass: 'border-t-status-open'        },
  in_progress: { label: 'In Progress', accentClass: 'border-t-status-in-progress' },
  closed:      { label: 'Closed',      accentClass: 'border-t-status-closed'      },
}

// ─────────────────────────────────────────────────────────────
//  KanbanColumn
// ─────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  status:  TicketStatus
  tickets: TicketWithProfiles[]
  onCardClick: (ticket: TicketWithProfiles) => void
}

export function KanbanColumn({ status, tickets, onCardClick }: KanbanColumnProps) {
  const { label, accentClass } = columnConfig[status]

  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-lg border-t-[3px] bg-bg',
        accentClass,
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </h2>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
          {tickets.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        id={status}
        items={tickets.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-1 flex-col gap-2 overflow-y-auto p-2 rounded-b-lg min-h-[200px]',
            'transition-colors',
            isOver && 'bg-jira-blue-light/40',
          )}
        >
          {tickets.map(ticket => (
            <KanbanCard
              key={ticket.id}
              ticket={ticket}
              onClick={onCardClick}
            />
          ))}

          {tickets.length === 0 && (
            <div className={cn(
              'flex flex-1 items-center justify-center rounded-md py-8',
              isOver ? 'border-2 border-dashed border-jira-blue' : 'border-2 border-dashed border-gray-200',
            )}>
              <p className="text-xs text-text-muted">Drop here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
