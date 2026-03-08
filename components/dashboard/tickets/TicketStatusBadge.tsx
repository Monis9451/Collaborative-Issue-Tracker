import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import type { TicketStatus } from '@/types/database'

const statusConfig: Record<TicketStatus, { label: string; variant: BadgeVariant }> = {
  open:        { label: 'Open',        variant: 'blue'   },
  in_progress: { label: 'In Progress', variant: 'orange' },
  closed:      { label: 'Closed',      variant: 'green'  },
}

interface TicketStatusBadgeProps {
  status:     TicketStatus
  className?: string
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const { label, variant } = statusConfig[status]
  return <Badge label={label} variant={variant} dot className={className} />
}
