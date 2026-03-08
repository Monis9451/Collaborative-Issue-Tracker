'use client'

import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useDeleteComment } from '@/hooks/useDeleteComment'
import type { CommentWithAuthor } from '@/hooks/useTicketComments'
import type { AppRole } from '@/types/database'

interface CommentItemProps {
  comment:     CommentWithAuthor
  currentUserId: string
  userRole:    AppRole | null
}

export function CommentItem({ comment, currentUserId, userRole }: CommentItemProps) {
  const deleteComment = useDeleteComment(comment.ticket_id)

  const canDelete =
    comment.author_id === currentUserId || userRole === 'admin'

  const initials = comment.author.full_name
    ? comment.author.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : comment.author.email[0].toUpperCase()

  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                      bg-jira-blue-light text-[10px] font-bold text-jira-blue mt-0.5">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-text-primary truncate">
            {comment.author.full_name ?? comment.author.email}
          </span>
          <span className="text-[11px] text-text-muted shrink-0">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Body */}
        <p className="mt-0.5 text-sm text-text-secondary whitespace-pre-wrap break-words">
          {comment.body}
        </p>
      </div>

      {/* Delete */}
      {canDelete && (
        <button
          type="button"
          onClick={() => deleteComment.mutate(comment.id)}
          disabled={deleteComment.isPending}
          aria-label="Delete comment"
          className={cn(
            'shrink-0 flex h-6 w-6 items-center justify-center rounded text-text-muted',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity',
            'hover:bg-danger-light hover:text-danger cursor-pointer',
            'disabled:opacity-30',
          )}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
