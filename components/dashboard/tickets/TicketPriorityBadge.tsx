import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import type { TicketPriority } from '@/types/database'
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react'

const priorityConfig: Record<TicketPriority, { label: string; variant: BadgeVariant }> = {
  high:   { label: 'High',   variant: 'red'    },
  medium: { label: 'Medium', variant: 'orange' },
  low:    { label: 'Low',    variant: 'green'  },
}

const PriorityIcon = {
  high:   ArrowUp,
  medium: ArrowRight,
  low:    ArrowDown,
}

interface TicketPriorityBadgeProps {
  priority:   TicketPriority
  showIcon?:  boolean
  className?: string
}

export function TicketPriorityBadge({
  priority,
  showIcon = false,
  className,
}: TicketPriorityBadgeProps) {
  const { label, variant } = priorityConfig[priority]
  const Icon = PriorityIcon[priority]

  return (
    <span className="inline-flex items-center gap-1">
      {showIcon && <Icon className="h-3 w-3 text-current opacity-70" strokeWidth={2.5} />}
      <Badge label={label} variant={variant} className={className} />
    </span>
  )
}
