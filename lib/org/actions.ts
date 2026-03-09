'use server'

import { createClient } from '@/lib/supabase/server'


const ERROR_MESSAGES: Record<string, string> = {
  not_authenticated: 'You must be signed in.',
  not_admin:         'Only admins can delete an organization.',
  org_not_found:     'Organization not found.',
}

function mapError(message: string): string {
  const key = Object.keys(ERROR_MESSAGES).find(k =>
    message.toLowerCase().includes(k),
  )
  return key ? ERROR_MESSAGES[key] : message
}

export async function deleteOrgAction(orgId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('delete_organization', {
    p_org_id: orgId,
  })

  if (error) throw new Error(mapError(error.message))
}
