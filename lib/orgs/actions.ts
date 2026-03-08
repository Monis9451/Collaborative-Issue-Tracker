'use server'

import { createClient } from '@/lib/supabase/server'
import type { Organization } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  Organization Server Actions
//
//  Uses rpc() to call a SECURITY DEFINER Postgres function.
//  This bypasses PostgREST's internal ES256 JWT re-verification
//  bug which causes auth.uid() to return NULL at the RLS layer,
//  while still keeping auth.uid() accurate inside the function.
// ─────────────────────────────────────────────────────────────

export interface CreateOrgInput {
  name: string
  slug: string
}

export async function createOrganizationAction(
  input: CreateOrgInput,
): Promise<Organization> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('create_organization', {
    org_name: input.name.trim(),
    org_slug: input.slug.trim(),
  })

  if (error) {
    if (error.code === '23505' || error.message.includes('unique')) {
      throw new Error('That slug is already taken — please choose another.')
    }
    throw new Error(error.message)
  }

  return data as unknown as Organization
}
