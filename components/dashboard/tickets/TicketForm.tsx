'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateTicket } from '@/hooks/useCreateTicket'
import { useUpdateTicket } from '@/hooks/useUpdateTicket'
import { useOrgMembers } from '@/hooks/useOrgMembers'
import type { TicketWithProfiles, TicketPriority } from '@/types/database'

// ─────────────────────────────────────────────────────────────
//  Schema
// ─────────────────────────────────────────────────────────────

/**
 * In create mode (originalDueDate = undefined): any non-empty due date must be
 * today or later.
 * In edit mode: the original due date is always allowed unchanged (so admins
 * aren't forced to update a date they didn't touch); any *new* date still must
 * be today or later.
 */
function makeTicketSchema(originalDueDate?: string | null) {
  const today = new Date().toISOString().split('T')[0]
  return z.object({
    title:       z.string().min(1, 'Title is required').max(200),
    description: z.string().max(5000).optional().or(z.literal('')),
    priority:    z.enum(['low', 'medium', 'high']),
    assigneeId:  z.string().optional().or(z.literal('')),
    dueDate:     z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (!val) return true                    // cleared — OK
          if (val === originalDueDate) return true // unchanged existing date — OK
          return val >= today                      // new date must be today or later
        },
        { message: 'Due date must be today or a future date' },
      ),
  })
}

type TicketFormValues = z.infer<ReturnType<typeof makeTicketSchema>>

// ─────────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────────

interface TicketFormProps {
  orgId:       string
  /** When provided, the form switches to edit mode */
  ticket?:     TicketWithProfiles
  onSuccess?:  () => void
  onCancel?:   () => void
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export function TicketForm({ orgId, ticket, onSuccess, onCancel }: TicketFormProps) {
  const isEdit = !!ticket

  const createTicket = useCreateTicket(orgId)
  const updateTicket = useUpdateTicket(orgId)
  const { data: members = [] } = useOrgMembers(orgId)

  const schema = useMemo(() => makeTicketSchema(ticket?.due_date), [ticket?.due_date])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormValues>({
    resolver:     zodResolver(schema),
    defaultValues: {
      title:       ticket?.title       ?? '',
      description: ticket?.description ?? '',
      priority:    ticket?.priority    ?? 'medium',
      assigneeId:  ticket?.assignee_id ?? '',
      dueDate:     ticket?.due_date    ?? '',
    },
  })

  // Reset when the target ticket changes (e.g. switching between tickets)
  useEffect(() => {
    if (isEdit && ticket) {
      reset({
        title:       ticket.title,
        description: ticket.description ?? '',
        priority:    ticket.priority,
        assigneeId:  ticket.assignee_id ?? '',
        dueDate:     ticket.due_date    ?? '',
      })
    }
  }, [ticket?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const isPending = createTicket.isPending || updateTicket.isPending
  const mutationError = createTicket.error || updateTicket.error

  const onSubmit = handleSubmit(async (values) => {
    const shared = {
      title:       values.title,
      description: values.description || null,
      priority:    values.priority as TicketPriority,
      assigneeId:  values.assigneeId || null,
      dueDate:     values.dueDate    || null,
      tags:        [],
    }

    if (isEdit && ticket) {
      updateTicket.mutate(
        { ticketId: ticket.id, ...shared },
        { onSuccess },
      )
    } else {
      createTicket.mutate(
        { orgId, ...shared },
        {
          onSuccess: () => {
            reset()
            onSuccess?.()
          },
        },
      )
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <label htmlFor="tf-title" className="text-xs font-semibold text-text-secondary">
          Title <span className="text-danger">*</span>
        </label>
        <input
          id="tf-title"
          {...register('title')}
          placeholder="Short summary of the issue"
          className="rounded-md border border-border bg-white px-3 py-2 text-sm
                     text-text-primary placeholder:text-text-muted
                     focus:border-jira-blue focus:outline-none focus:ring-2
                     focus:ring-jira-blue/20 transition-colors"
        />
        {errors.title && (
          <p className="text-xs text-danger">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="tf-desc" className="text-xs font-semibold text-text-secondary">
          Description
        </label>
        <textarea
          id="tf-desc"
          {...register('description')}
          placeholder="Steps to reproduce, context, acceptance criteria…"
          rows={4}
          className="resize-none rounded-md border border-border bg-white px-3 py-2
                     text-sm text-text-primary placeholder:text-text-muted
                     focus:border-jira-blue focus:outline-none focus:ring-2
                     focus:ring-jira-blue/20 transition-colors"
        />
      </div>

      {/* Priority + Assignee row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Priority */}
        <div className="flex flex-col gap-1">
          <label htmlFor="tf-priority" className="text-xs font-semibold text-text-secondary">
            Priority
          </label>
          <select
            id="tf-priority"
            {...register('priority')}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm
                       text-text-primary focus:border-jira-blue focus:outline-none
                       focus:ring-2 focus:ring-jira-blue/20 transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Assignee */}
        <div className="flex flex-col gap-1">
          <label htmlFor="tf-assignee" className="text-xs font-semibold text-text-secondary">
            Assignee
          </label>
          <select
            id="tf-assignee"
            {...register('assigneeId')}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm
                       text-text-primary focus:border-jira-blue focus:outline-none
                       focus:ring-2 focus:ring-jira-blue/20 transition-colors"
          >
            <option value="">Unassigned</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>
                {m.profile.full_name ?? m.profile.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due date */}
      <div className="flex flex-col gap-1">
        <label htmlFor="tf-due" className="text-xs font-semibold text-text-secondary">
          Due date
        </label>
        <input
          id="tf-due"
          type="date"
          min={
            // In edit mode with an existing past date, allow that date unchanged.
            // Otherwise restrict to today or later.
            isEdit && ticket?.due_date
              ? (ticket.due_date < new Date().toISOString().split('T')[0]
                  ? ticket.due_date
                  : new Date().toISOString().split('T')[0])
              : new Date().toISOString().split('T')[0]
          }
          {...register('dueDate')}
          className="rounded-md border border-border bg-white px-3 py-2 text-sm
                     text-text-primary focus:border-jira-blue focus:outline-none
                     focus:ring-2 focus:ring-jira-blue/20 transition-colors"
        />
        {errors.dueDate && (
          <p className="text-xs text-danger">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Error */}
      {mutationError && (
        <p className="text-xs text-danger">
          {(mutationError as Error).message}
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-1.5 text-xs font-semibold
                       text-text-secondary transition-colors hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="rounded-md bg-jira-blue px-4 py-1.5 text-xs font-semibold
                     text-white transition-colors hover:bg-jira-blue-hover
                     disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isPending
            ? isEdit ? 'Saving…' : 'Creating…'
            : isEdit ? 'Save changes' : 'Create ticket'}
        </button>
      </div>
    </form>
  )
}
