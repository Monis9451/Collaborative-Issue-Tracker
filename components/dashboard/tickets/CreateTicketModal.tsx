'use client'

import { Modal } from '@/components/ui/Modal'
import { TicketForm } from '@/components/dashboard/tickets/TicketForm'

// ─────────────────────────────────────────────────────────────
//  CreateTicketModal — dialog for creating a new ticket,
//  matching the same UX pattern as CreateOrgModal.
// ─────────────────────────────────────────────────────────────

interface CreateTicketModalProps {
  open:    boolean
  onClose: () => void
  orgId:   string
}

export function CreateTicketModal({ open, onClose, orgId }: CreateTicketModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create ticket"
      description="Fill in the details below to create a new ticket for this workspace."
      size="lg"
    >
      <TicketForm
        orgId={orgId}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  )
}
