'use server'

import { createClient } from '@/lib/supabase/server'
import type { TicketComment } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  Comment Server Actions
//  All mutations via SECURITY DEFINER RPC (see patch_002 SQL).
// ─────────────────────────────────────────────────────────────

// ── Create ────────────────────────────────────────────────────

export async function createCommentAction(
  ticketId: string,
  body:     string,
): Promise<TicketComment> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('create_comment', {
    p_ticket_id: ticketId,
    p_body:      body.trim(),
  })

  if (error) throw new Error(error.message)
  return data as unknown as TicketComment
}

// ── Delete ────────────────────────────────────────────────────

export async function deleteCommentAction(commentId: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { error } = await supabase.rpc('delete_comment', {
    p_comment_id: commentId,
  })

  if (error) throw new Error(error.message)
}
