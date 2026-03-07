'use client'

import { useState } from 'react'
import { UserPlus, Mail } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useAddOrgMember } from '@/hooks/useAddOrgMember'

// ─────────────────────────────────────────────────────────────
//  AddMemberModal
// ─────────────────────────────────────────────────────────────

interface AddMemberModalProps {
  open:    boolean
  onClose: () => void
  orgId:   string
}

export function AddMemberModal({ open, onClose, orgId }: AddMemberModalProps) {
  const [email, setEmail] = useState('')
  const addMember = useAddOrgMember(orgId)

  const handleClose = () => {
    setEmail('')
    addMember.reset()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || addMember.isPending) return   // guard against double-submit
    addMember.mutate(email.trim(), {
      onSuccess: () => {
        setEmail('')
        onClose()  // reset() removed — it was cancelling the triggered refetch
      },
    })
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add member"
      description="Enter the email address of the person you want to add. They must already have an account."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email input */}
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            strokeWidth={2}
          />
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); addMember.reset() }}
            placeholder="name@example.com"
            autoFocus
            required
            className="w-full rounded-xl border border-border bg-gray-50 py-2.5 pl-9 pr-4
                       text-sm text-text-primary placeholder:text-text-muted
                       focus:border-jira-blue focus:bg-white focus:outline-none
                       focus:ring-2 focus:ring-jira-blue/20 transition-colors"
          />
        </div>

        {/* Error feedback */}
        {addMember.isError && (
          <p className="flex items-center gap-1.5 rounded-lg bg-danger-light px-3 py-2
                         text-sm font-medium text-danger">
            {(addMember.error as Error).message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-text-secondary
                       hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!email.trim() || addMember.isPending}
            className="flex items-center gap-2 rounded-lg bg-jira-blue px-4 py-2
                       text-sm font-semibold text-white transition-colors
                       hover:bg-jira-blue-hover disabled:opacity-50
                       disabled:cursor-not-allowed cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" strokeWidth={2.5} />
            {addMember.isPending ? 'Adding…' : 'Add member'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
