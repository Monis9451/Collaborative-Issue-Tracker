'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCardBody } from './KanbanCard'
import { TicketDetail } from '@/components/dashboard/tickets/TicketDetail'
import { CreateTicketModal } from '@/components/dashboard/tickets/CreateTicketModal'
import { useTickets } from '@/hooks/useTickets'
import { useUpdateTicketStatus } from '@/hooks/useUpdateTicket'
import type { TicketWithProfiles, TicketStatus, AppRole } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  KanbanBoard
// ─────────────────────────────────────────────────────────────

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'closed']

interface KanbanBoardProps {
  orgId:         string
  currentUserId: string
  userRole:      AppRole | null
}

export function KanbanBoard({ orgId, currentUserId, userRole }: KanbanBoardProps) {
  const { data: tickets = [], isLoading, isError } = useTickets(orgId)
  const updateStatus = useUpdateTicketStatus(orgId)

  // ── Selected ticket (slide-over) ─────────────────────────
  const [selectedTicket, setSelectedTicket] = useState<TicketWithProfiles | null>(null)

  // ── Create ticket modal ───────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false)

  // ── Active drag id (for DragOverlay) ─────────────────────
  const [activeId, setActiveId] = useState<string | null>(null)

  // ── Group tickets by status (exclude the card being dragged) ─
  const columns = useMemo(() => {
    const map: Record<TicketStatus, TicketWithProfiles[]> = {
      open:        [],
      in_progress: [],
      closed:      [],
    }
    for (const t of tickets) {
      if (t.id !== activeId) map[t.status].push(t)   // hide while dragging
    }
    return map
  }, [tickets, activeId])

  // ── The ticket being dragged (for the overlay card) ───────
  const activeTicket = useMemo(
    () => activeId ? tickets.find(t => t.id === activeId) ?? null : null,
    [activeId, tickets],
  )

  // ── DnD sensors ──────────────────────────────────────────
  const sensors = useSensors(
    // Mouse / trackpad only — mobile uses the 3-dot move menu instead
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  // ── Mobile move handler (3-dot menu) ─────────────────────────────
  const handleMoveStatus = useCallback(
    (ticketId: string, status: TicketStatus) => {
      updateStatus.mutate({ ticketId, status })
    },
    [updateStatus],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over || active.id === over.id) {
        setActiveId(null)
        return
      }

      const ticketId = active.id as string

      // over.id is either a column id (TicketStatus) or another ticket id
      const targetStatus = (
        STATUSES.includes(over.id as TicketStatus)
          ? over.id
          : tickets.find(t => t.id === over.id)?.status
      ) as TicketStatus | undefined

      if (!targetStatus) { setActiveId(null); return }

      const sourceTicket = tickets.find(t => t.id === ticketId)
      if (!sourceTicket || sourceTicket.status === targetStatus) {
        setActiveId(null)
        return
      }

      // Fire optimistic update first, then clear the overlay in the next
      // micro-task so TanStack Query's onMutate (cancelQueries + setQueryData)
      // runs before the card is revealed in the source column.
      updateStatus.mutate({ ticketId, status: targetStatus })
      setTimeout(() => setActiveId(null), 0)
    },
    [tickets, updateStatus],
  )

  const handleDragCancel = useCallback(() => setActiveId(null), [])

  const handleCardClick = useCallback((ticket: TicketWithProfiles) => {
    setSelectedTicket(ticket)
  }, [])

  const liveSelectedTicket = useMemo(
    () => selectedTicket
      ? (tickets.find(t => t.id === selectedTicket.id) ?? selectedTicket)
      : null,
    [selectedTicket, tickets],
  )

  // ── Render ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <span className="text-sm text-text-muted">Loading board…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <span className="text-sm text-danger">Failed to load tickets. Try refreshing.</span>
      </div>
    )
  }

  return (
    <>
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-white">
        <h1 className="text-sm font-semibold text-text-primary">Board</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-jira-blue px-3 py-1.5
                     text-xs font-semibold text-white transition-colors
                     hover:bg-jira-blue-hover cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Create ticket
        </button>
      </div>

      {/* ── Kanban columns ───────────────────────────────────── */}
      {/* Mobile: vertical scroll — columns stack, no gesture conflict with DnD. */}
      {/* Desktop: horizontal scroll with fixed-height columns.                  */}
      <div className="flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex flex-col gap-4 p-4 md:flex-row md:h-full md:items-start md:p-5">
            {STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                tickets={columns[status]}
                onCardClick={handleCardClick}
                onMoveStatus={handleMoveStatus}
              />
            ))}
          </div>

          {/* ── Drag ghost — follows the cursor smoothly ─────── */}
          <DragOverlay dropAnimation={null}>
            {activeTicket ? (
              <div className="w-[calc(100vw-2rem)] md:w-72">
                <KanbanCardBody ticket={activeTicket} isDragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Ticket detail slide-over ──────────────────────────── */}
      <TicketDetail
        ticket={liveSelectedTicket}
        orgId={orgId}
        currentUserId={currentUserId}
        userRole={userRole}
        onClose={() => setSelectedTicket(null)}
      />

      {/* ── Create ticket modal ───────────────────────────────── */}
      <CreateTicketModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        orgId={orgId}
      />
    </>
  )
}
