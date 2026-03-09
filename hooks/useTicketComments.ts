'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { TicketComment, Profile } from '@/types/database'


export interface CommentWithAuthor extends TicketComment {
  author: Profile
}

async function fetchTicketComments(ticketId: string): Promise<CommentWithAuthor[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*, author:profiles!ticket_comments_author_id_fkey(*)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return data as unknown as CommentWithAuthor[]
}

export function useTicketComments(ticketId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.list(ticketId ?? ''),
    queryFn:  () => fetchTicketComments(ticketId!),
    enabled:  !!ticketId,
    staleTime: 15 * 1000, // 15 seconds
  })
}
