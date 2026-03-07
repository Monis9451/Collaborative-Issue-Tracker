'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useCreateComment } from '@/hooks/useCreateComment'

// ─────────────────────────────────────────────────────────────
//  CommentModal — dialog for adding a comment to a ticket.
// ─────────────────────────────────────────────────────────────

interface CommentModalProps {
  open:     boolean
  onClose:  () => void
  ticketId: string
}

export function CommentModal({ open, onClose, ticketId }: CommentModalProps) {
  const [body, setBody]   = useState('')
  const createComment     = useCreateComment(ticketId)

  const handleClose = () => {
    setBody('')
    createComment.reset()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    createComment.mutate(body.trim(), {
      onSuccess: handleClose,
    })
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add comment"
      description="Share an update, ask a question, or leave a note on this ticket."
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Write your comment here…"
          rows={5}
          autoFocus
          className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5
                     text-sm text-text-primary placeholder:text-text-muted
                     focus:border-jira-blue focus:outline-none focus:ring-2
                     focus:ring-jira-blue/20 transition-colors"
        />

        {createComment.isError && (
          <p className="text-xs text-danger">
            {(createComment.error as Error).message}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-border px-4 py-1.5 text-xs font-semibold
                       text-text-secondary transition-colors hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!body.trim() || createComment.isPending}
            className="rounded-md bg-jira-blue px-4 py-1.5 text-xs font-semibold
                       text-white transition-colors hover:bg-jira-blue-hover
                       disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {createComment.isPending ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
