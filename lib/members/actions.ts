'use server'

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
//  Member Server Actions
// ─────────────────────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, string> = {
  user_not_found:      'No account found with that email address.',
  already_member:      'That person is already a member of this workspace.',
  not_admin:           'Only admins can perform this action.',
  not_authenticated:   'You must be signed in.',
  member_not_found:    'Member not found.',
  cannot_remove_self:  'You cannot remove yourself from the workspace.',
  cannot_remove_admin: 'Admin members cannot be removed.',
}

function mapError(message: string): string {
  const key = Object.keys(ERROR_MESSAGES).find(k =>
    message.toLowerCase().includes(k),
  )
  return key ? ERROR_MESSAGES[key] : message
}

export async function addOrgMemberAction(orgId: string, email: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('add_org_member', {
    p_org_id: orgId,
    p_email:  email.trim().toLowerCase(),
  })

  if (error) throw new Error(mapError(error.message))
}

export async function removeOrgMemberAction(memberId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('remove_org_member', {
    p_member_id: memberId,
  })

  if (error) throw new Error(mapError(error.message))
}
