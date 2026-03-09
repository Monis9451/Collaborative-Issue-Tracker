'use server'

import { createClient } from '@/lib/supabase/server'
import type { Ticket, TicketStatus, TicketPriority } from '@/types/database'

export interface CreateTicketInput {
  orgId:       string
  title:       string
  description: string | null
  priority:    TicketPriority
  assigneeId:  string | null
  dueDate:     string | null   // ISO date string "YYYY-MM-DD"
  tags:        string[]
}

export interface UpdateTicketInput {
  ticketId:    string
  title:       string
  description: string | null
  priority:    TicketPriority
  assigneeId:  string | null
  dueDate:     string | null
  tags:        string[]
}

// ── Create ────────────────────────────────────────────────────

export async function createTicketAction(
  input: CreateTicketInput,
): Promise<Ticket> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('create_ticket', {
    p_org_id:       input.orgId,
    p_title:        input.title.trim(),
    p_description:  input.description?.trim() ?? null,
    p_priority:     input.priority,
    p_assignee_id:  input.assigneeId ?? null,
    p_due_date:     input.dueDate ?? null,
    p_tags:         input.tags ?? [],
  })

  if (error) throw new Error(error.message)
  return data as unknown as Ticket
}

// ── Update (full edit) ────────────────────────────────────────

export async function updateTicketAction(
  input: UpdateTicketInput,
): Promise<Ticket> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('update_ticket', {
    p_ticket_id:   input.ticketId,
    p_title:       input.title.trim(),
    p_description: input.description?.trim() ?? null,
    p_priority:    input.priority,
    p_assignee_id: input.assigneeId ?? null,
    p_due_date:    input.dueDate ?? null,
    p_tags:        input.tags ?? [],
  })

  if (error) throw new Error(error.message)
  return data as unknown as Ticket
}

// ── Update status (drag-and-drop) ────────────────────────────

export async function updateTicketStatusAction(
  ticketId: string,
  status:   TicketStatus,
): Promise<Ticket> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('update_ticket_status', {
    p_ticket_id: ticketId,
    p_status:    status,
  })

  if (error) throw new Error(error.message)
  return data as unknown as Ticket
}

// ── Delete (soft-delete) ──────────────────────────────────────

export async function deleteTicketAction(ticketId: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Not authenticated')

  const { error } = await supabase.rpc('delete_ticket', {
    p_ticket_id: ticketId,
  })

  if (error) throw new Error(error.message)
}
