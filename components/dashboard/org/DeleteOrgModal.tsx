'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useDeleteOrg } from '@/hooks/useDeleteOrg'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
//  DeleteOrgModal
//
//  Requires the admin to type the exact org name before the
//  Delete button is enabled — prevents accidental irreversible
//  deletions.
//
//  What gets deleted (via ON DELETE CASCADE in schema):
//   · All tickets in the org
//   · All ticket comments
//   · All org members rows
//   · The organization itself
// ─────────────────────────────────────────────────────────────

interface DeleteOrgModalProps {
  open:    boolean
  orgId:   string
  orgName: string
  onClose: () => void
}

export function DeleteOrgModal({ open, orgId, orgName, onClose }: DeleteOrgModalProps) {
  const [input,     setInput]     = useState('')
  const [serverErr, setServerErr] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const deleteOrg = useDeleteOrg()

  const confirmed = input.trim() === orgName.trim()

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setInput('')
      setServerErr(null)
      // Focus the input after the animation settles
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const handleDelete = () => {
    if (!confirmed || deleteOrg.isPending) return
    setServerErr(null)

    deleteOrg.mutate(orgId, {
      onSuccess: () => {
        onClose()
      },
      onError: (err) => {
        setServerErr((err as Error).message)
      },
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-org-title"
        className="fixed left-1/2 top-1/2 z-60 w-full max-w-md -translate-x-1/2 -translate-y-1/2
                   rounded-2xl border border-border bg-white shadow-modal p-6
                   flex flex-col gap-5"
      >
        {/* ── Warning icon + heading ────────────────────────── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-light">
            <AlertTriangle className="h-6 w-6 text-danger" strokeWidth={2} />
          </div>
          <div>
            <h2
              id="delete-org-title"
              className="text-base font-bold text-text-primary"
            >
              Delete &ldquo;{orgName}&rdquo;?
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              This will permanently delete the organization and{' '}
              <strong className="text-danger">all its tickets, comments and members</strong>.
              This cannot be undone.
            </p>
          </div>
        </div>

        {/* ── Confirmation input ────────────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="delete-org-confirm"
            className="text-xs font-semibold text-text-secondary"
          >
            Type <span className="font-bold text-text-primary">{orgName}</span> to confirm
          </label>
          <input
            ref={inputRef}
            id="delete-org-confirm"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleDelete() }}
            placeholder={orgName}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors',
              'placeholder:text-text-muted/50',
              confirmed
                ? 'border-danger bg-danger-light/30 text-danger focus:ring-2 focus:ring-danger/30'
                : 'border-border bg-white text-text-primary focus:border-jira-blue focus:ring-2 focus:ring-jira-blue/20',
            )}
          />
        </div>

        {/* ── Server error ──────────────────────────────────── */}
        {serverErr && (
          <p className="rounded-lg bg-danger-light px-3 py-2 text-xs font-medium text-danger">
            {serverErr}
          </p>
        )}

        {/* ── Actions ───────────────────────────────────────── */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteOrg.isPending}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm
                       font-semibold text-text-secondary transition-colors
                       hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || deleteOrg.isPending}
            className={cn(
              'flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors',
              confirmed && !deleteOrg.isPending
                ? 'bg-danger hover:bg-danger/90 cursor-pointer'
                : 'bg-danger/40 cursor-not-allowed',
            )}
          >
            {deleteOrg.isPending ? 'Deleting…' : 'Delete organization'}
          </button>
        </div>
      </div>
    </>
  )
}
