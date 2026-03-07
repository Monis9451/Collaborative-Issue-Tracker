'use client'

import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { useTicketComments } from '@/hooks/useTicketComments'
import { CommentItem } from './CommentItem'
import { CommentModal } from './CommentModal'
import type { AppRole } from '@/types/database'

interface CommentListProps {
  ticketId:      string
  currentUserId: string
  userRole:      AppRole | null
}

export function CommentList({ ticketId, currentUserId, userRole }: CommentListProps) {
  const { data: comments = [], isLoading } = useTicketComments(ticketId)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section>
      {/* ── Header + add button ──────────────────────────── */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Comments ({comments.length})
        </h3>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-jira-blue px-2.5 py-1
                     text-[11px] font-semibold text-white transition-colors
                     hover:bg-jira-blue-hover cursor-pointer"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" strokeWidth={2} />
          Add comment
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Loading comments…</p>
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

      <CommentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ticketId={ticketId}
      />
    </section>
  )
}
