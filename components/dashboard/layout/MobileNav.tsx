'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { KanbanSquare, Users, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Organization } from '@/types/database'

interface MobileNavProps {
  org: Organization
}

export function MobileNav({ org }: MobileNavProps) {
  const pathname = usePathname()
  const base     = `/dashboard/${org.slug}`

  const tabs = [
    {
      href:    '/dashboard',
      label:   'All Orgs',
      icon:    ChevronLeft,
      active:  false,
      isBack:  true,
    },
    {
      href:    base,
      label:   'Board',
      icon:    KanbanSquare,
      active:  pathname === base,
      isBack:  false,
    },
    {
      href:    `${base}/members`,
      label:   'Members',
      icon:    Users,
      active:  pathname.endsWith('/members'),
      isBack:  false,
    },
  ]

  return (
    <nav
      className="md:hidden flex shrink-0 items-center border-b border-border bg-white"
      aria-label="Workspace navigation"
    >
      {tabs.map(({ href, label, icon: Icon, active, isBack }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
            active
              ? 'text-jira-blue'
              : isBack
              ? 'text-text-muted hover:text-text-secondary'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
          <span>{label}</span>
          {active && (
            <span className="h-0.5 w-5 rounded-full bg-jira-blue" />
          )}
        </Link>
      ))}
    </nav>
  )
}
