'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2, X, Send } from 'lucide-react'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { TicketForm } from './TicketForm'
import { CommentItem } from './CommentItem'
import { useDeleteTicket } from '@/hooks/useDeleteTicket'
import { useTicketComments } from '@/hooks/useTicketComments'
import { useCreateComment } from '@/hooks/useCreateComment'
import type { TicketWithProfiles, AppRole } from '@/types/database'
import { format } from 'date-fns'

// ─────────────────────────────────────────────────────────────
//  TicketDetail — centered dialog
// ─────────────────────────────────────────────────────────────

interface TicketDetailProps {
  ticket:        TicketWithProfiles | null
  orgId:         string
  currentUserId: string
  userRole:      AppRole | null
  onClose:       () => void
}

export function TicketDetail({
  ticket,
  orgId,
  currentUserId,
  userRole,
  onClose,
}: TicketDetailProps) {
  const [editing, setEditing] = useState(false)

  // Reset edit mode whenever the selected ticket changes
  useEffect(() => { setEditing(false) }, [ticket?.id])

  const deleteTicket = useDeleteTicket(orgId)

  const canEdit =
    userRole === 'admin' ||
    ticket?.created_by === currentUserId ||
    ticket?.assignee_id === currentUserId

  const canDelete =
    userRole === 'admin' || ticket?.created_by === currentUserId

  // Escape key to close
  useEffect(() => {
    if (!ticket) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [ticket, onClose])

  // Body scroll lock while open
  useEffect(() => {
    document.body.style.overflow = ticket ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [!!ticket])

  const handleDelete = () => {
    if (!ticket) return
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return
    deleteTicket.mutate(ticket.id, { onSuccess: onClose })
  }

  return (
    <AnimatePresence>
      {ticket && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            key="td-backdrop"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            key="td-panel"
            className="relative z-10 flex w-full max-w-2xl flex-col rounded-2xl bg-white shadow-modal"
            style={{ maxHeight: 'calc(100vh - 3rem)', height: '88vh' }}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {editing ? (
              <EditMode
                orgId={orgId}
                ticket={ticket}
                onDone={() => setEditing(false)}
                onClose={onClose}
              />
            ) : (
              <ViewMode
                ticket={ticket}
                currentUserId={currentUserId}
                userRole={userRole}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={() => setEditing(true)}
                onDelete={handleDelete}
                onClose={onClose}
                deleteIsPending={deleteTicket.isPending}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────
//  ViewMode
// ─────────────────────────────────────────────────────────────

interface ViewModeProps {
  ticket:          TicketWithProfiles
  currentUserId:   string
  userRole:        AppRole | null
  canEdit:         boolean
  canDelete:       boolean
  onEdit:          () => void
  onDelete:        () => void
  onClose:         () => void
  deleteIsPending: boolean
}

function ViewMode({
  ticket, currentUserId, userRole,
  canEdit, canDelete, onEdit, onDelete, onClose, deleteIsPending,
}: ViewModeProps) {
  const { data: comments = [], isLoading: commentsLoading } = useTicketComments(ticket.id)
  const createComment = useCreateComment(ticket.id)
  const [body, setBody] = useState('')
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when new comment arrives
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  const handleSend = () => {
    if (!body.trim() || createComment.isPending) return
    createComment.mutate(body.trim(), { onSuccess: () => setBody('') })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const creatorName = ticket.creator.full_name ?? ticket.creator.email

  return (
    <>
      {/* ── Fixed header ──────────────────────────────────── */}
      <div className="flex shrink-0 items-start justify-between gap-3 px-6 pt-5 pb-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-text-primary leading-snug break-words">
            {ticket.title}
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            <span className="font-medium text-text-secondary">{creatorName}</span>
            <span className="mx-1.5 text-border">·</span>
            {format(new Date(ticket.created_at), 'dd MMM yyyy')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit ticket"
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted
                         hover:bg-gray-100 hover:text-jira-blue transition-colors cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleteIsPending}
              aria-label="Delete ticket"
              className="flex h-7 w-7 items-center justify-center rounded text-text-muted
                         hover:bg-danger-light hover:text-danger transition-colors
                         cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded text-text-muted
                       hover:bg-gray-100 hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Badges ────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-2 px-6 pb-4">
        <TicketStatusBadge status={ticket.status} />
        <TicketPriorityBadge priority={ticket.priority} />
      </div>

      {/* ── Scrollable body ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 pb-2">
        {/* Description */}
        {ticket.description && (
          <p className="mb-5 text-sm text-text-secondary whitespace-pre-wrap break-words leading-relaxed">
            {ticket.description}
          </p>
        )}

        {/* Meta — only render rows that have values */}
        {(ticket.assignee || ticket.due_date) && (
          <div className="mb-5 flex flex-wrap gap-x-8 gap-y-3">
            {ticket.assignee && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                  Assignee
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {ticket.assignee.full_name ?? ticket.assignee.email}
                </p>
              </div>
            )}
            {ticket.due_date && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-0.5">
                  Due Date
                </p>
                <p className="text-sm font-medium text-text-primary">
                  {format(new Date(ticket.due_date), 'dd MMM yyyy')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {ticket.tags?.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {ticket.tags.map(tag => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments list */}
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
          </p>

          {commentsLoading ? (
            <p className="text-sm text-text-muted">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm italic text-text-muted">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  userRole={userRole}
                />
              ))}
            </div>
          )}

          <div ref={commentsEndRef} />
        </div>
      </div>

      {/* ── Sticky WhatsApp-style input ────────────────────── */}
      <div className="shrink-0 border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment… (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-border bg-gray-50 px-4 py-2.5
                       text-sm text-text-primary placeholder:text-text-muted leading-snug
                       focus:border-jira-blue focus:bg-white focus:outline-none focus:ring-2
                       focus:ring-jira-blue/20 transition-colors"
            style={{ maxHeight: '96px', overflowY: 'auto' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!body.trim() || createComment.isPending}
            aria-label="Send comment"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                       bg-jira-blue text-white transition-colors hover:bg-jira-blue-hover
                       disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        {createComment.isError && (
          <p className="mt-1 text-xs text-danger px-1">
            {(createComment.error as Error).message}
          </p>
        )}
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
//  EditMode — TicketForm inside the same dialog
// ─────────────────────────────────────────────────────────────

interface EditModeProps {
  orgId:   string
  ticket:  TicketWithProfiles
  onDone:  () => void
  onClose: () => void
}

function EditMode({ orgId, ticket, onDone, onClose }: EditModeProps) {
  return (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <h2 className="text-base font-bold text-text-primary">Edit ticket</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded text-text-muted
                     hover:bg-gray-100 hover:text-text-primary transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <TicketForm
          orgId={orgId}
          ticket={ticket}
          onSuccess={onDone}
          onCancel={onDone}
        />
      </div>
    </>
  )
}
