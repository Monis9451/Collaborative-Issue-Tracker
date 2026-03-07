import type { Metadata } from 'next'
import { OrgsDashboard } from '@/components/dashboard/org/OrgsDashboard'

// ─────────────────────────────────────────────────────────────
//  Dashboard Home — composes OrgsDashboard client component.
//  All data-fetching and interactivity lives in OrgsDashboard.
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Dashboard — Collaborative Issue Tracker',
}

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-4 py-8 sm:px-6">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
          Organizations
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Select a workspace to manage tickets, or create a new one.
        </p>
      </div>

      <OrgsDashboard />
    </div>
  )
}
