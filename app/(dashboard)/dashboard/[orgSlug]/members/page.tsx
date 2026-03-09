import type { Metadata } from 'next'
import { MembersPageClient } from '@/components/dashboard/members/MembersPageClient'

//  Org Members Page

type Params = Promise<{ orgSlug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { orgSlug } = await params
  return { title: `${orgSlug} — Members` }
}

export default async function OrgMembersPage({ params }: { params: Params }) {
  const { orgSlug } = await params
  return <MembersPageClient orgSlug={orgSlug} />
}
