'use client'

import { useState } from 'react'
import { useCreateComment } from '@/hooks/useCreateComment'

interface CommentFormProps {
  ticketId: string
}

export function CommentForm({ ticketId }: CommentFormProps) {
  const [body, setBody]       = useState('')
  const createComment         = useCreateComment(ticketId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    createComment.mutate(body.trim(), {
      onSuccess: () => setBody(''),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Add a comment…"
        rows={3}
        className="w-full resize-none rounded-md border border-border bg-white px-3 py-2
                   text-sm text-text-primary placeholder:text-text-muted
                   focus:border-jira-blue focus:outline-none focus:ring-2
                   focus:ring-jira-blue/20 transition-colors"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!body.trim() || createComment.isPending}
          className="rounded-md bg-jira-blue px-4 py-1.5 text-xs font-semibold
                     text-white transition-colors hover:bg-jira-blue-hover
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {createComment.isPending ? 'Saving…' : 'Comment'}
        </button>
      </div>
      {createComment.isError && (
        <p className="text-xs text-danger">
          {(createComment.error as Error).message}
        </p>
      )}
    </form>
  )
}
