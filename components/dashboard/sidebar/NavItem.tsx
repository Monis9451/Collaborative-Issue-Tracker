'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItemProps {
  href:   string
  label:  string
  icon:   LucideIcon
  exact?: boolean
}

export function NavItem({ href, label, icon: Icon, exact }: NavItemProps) {
  const pathname = usePathname()
  const active   = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-jira-blue-light text-jira-blue'
          : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          active ? 'text-jira-blue' : 'text-text-muted group-hover:text-text-secondary',
        )}
        strokeWidth={active ? 2.2 : 1.8}
      />
      <span className="truncate">{label}</span>
    </Link>
  )
}
