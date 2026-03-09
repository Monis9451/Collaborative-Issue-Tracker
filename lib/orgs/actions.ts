'use server'

import { createClient } from '@/lib/supabase/server'
import type { Organization } from '@/types/database'

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
