import type { Metadata } from 'next'
import { WorkspacePageClient } from '@/components/dashboard/workspace/WorkspacePageClient'

// ─────────────────────────────────────────────────────────────
//  Org Workspace Page
//  Server component — resolves params and delegates to client.
//  Data-fetching and interaction happen fully client-side.
// ─────────────────────────────────────────────────────────────

type Params = Promise<{ orgSlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { orgSlug } = await params
  return { title: `${orgSlug} — Workspace` }
}

export default async function OrgWorkspacePage({ params }: { params: Params }) {
  const { orgSlug } = await params

  return <WorkspacePageClient orgSlug={orgSlug} />
}
