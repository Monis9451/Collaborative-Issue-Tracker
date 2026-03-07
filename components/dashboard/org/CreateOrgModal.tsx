'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { AnimatedPlaceholderInput } from '@/components/ui/AnimatedPlaceholderInput'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/Alert'
import { useCreateOrganization } from '@/hooks/useCreateOrganization'

// ─────────────────────────────────────────────────────────────
//  Zod schema
// ─────────────────────────────────────────────────────────────
const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or fewer'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(30, 'Slug must be 30 characters or fewer')
    .regex(slugRe, 'Only lowercase letters, numbers and hyphens (e.g. my-team)'),
})

type CreateOrgFormValues = z.infer<typeof createOrgSchema>

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30)
}

// ─────────────────────────────────────────────────────────────
//  CreateOrgModal
//
//  Props:
//   open     — controlled open state
//   onClose  — close callback
//   variant  — 'default' (small button) | 'prominent' (large CTA for empty state)
//
//  The modal is decoupled from its trigger — callers control
//  open/close state and pass in a trigger element separately.
// ─────────────────────────────────────────────────────────────

interface CreateOrgModalProps {
  open:    boolean
  onClose: () => void
}

export function CreateOrgModal({ open, onClose }: CreateOrgModalProps) {
  const id        = useId()
  const createOrg = useCreateOrganization()

  // Tracks the auto-derived slug internally — NOT written to the form in real-time.
  // It is only flushed into the input when the user focuses the slug field,
  // so the placeholder is clean while the user is still typing the name.
  const [derivedSlug, setDerivedSlug] = useState('')
  // Tracks whether the user has manually typed in the slug field.
  // If true, we stop overwriting their edits on focus.
  const slugUserEdited = useRef(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: '', slug: '' },
  })

  // Derive slug from name silently — only update local state, not the form field.
  const name = watch('name')
  useEffect(() => {
    setDerivedSlug(toSlug(name))
  }, [name])

  // When slug field is focused, flush the derived slug into the input
  // (only if the user hasn't manually edited it yet).
  function handleSlugFocus() {
    if (!slugUserEdited.current && derivedSlug) {
      setValue('slug', derivedSlug, { shouldValidate: false })
    }
  }

  // Intercept slug onChange to flag manual edits.
  const slugRegistration = register('slug', {
    onChange: () => { slugUserEdited.current = true },
  })

  // Close + reset on successful creation
  useEffect(() => {
    if (createOrg.isSuccess) {
      reset()
      setDerivedSlug('')
      slugUserEdited.current = false
      createOrg.reset()
      onClose()
    }
  }, [createOrg.isSuccess, createOrg, reset, onClose])

  // Reset slug state whenever the modal opens fresh
  useEffect(() => {
    if (open) {
      slugUserEdited.current = false
      setDerivedSlug('')
    } else {
      reset()
    }
  }, [open, reset])

  function onSubmit(values: CreateOrgFormValues) {
    createOrg.mutate(values)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Organization"
      description="Organizations are shared workspaces for your team's tickets."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {createOrg.isError && (
          <Alert variant="error">
            {(createOrg.error as Error).message}
          </Alert>
        )}

        <FormField label="Organization Name" htmlFor={`${id}-name`} error={errors.name?.message} required>
          <AnimatedPlaceholderInput
            id={`${id}-name`}
            type="text"
            autoComplete="off"
            placeholder="e.g. Acme Corp"
            hasError={!!errors.name}
            {...register('name')}
          />
        </FormField>

        <FormField
          label="Slug"
          htmlFor={`${id}-slug`}
          error={errors.slug?.message}
          required
        >
          <AnimatedPlaceholderInput
            id={`${id}-slug`}
            type="text"
            autoComplete="off"
            placeholder="e.g. acme-corp"
            hasError={!!errors.slug}
            onFocus={handleSlugFocus}
            {...slugRegistration}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={createOrg.isPending}
          >
            Create Organization
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ─────────────────────────────────────────────────────────────
//  NewOrgButton — small inline trigger (used beside section headings)
// ─────────────────────────────────────────────────────────────
interface NewOrgButtonProps {
  onClick: () => void
}

export function NewOrgButton({ onClick }: NewOrgButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full bg-jira-blue px-4 py-1.5
                 text-xs font-bold uppercase tracking-wider text-white shadow-sm
                 transition-all duration-150 hover:bg-jira-blue-hover hover:shadow-md
                 focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-2 cursor-pointer"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      New
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
//  ProminentCreateButton — large CTA for the empty state view
// ─────────────────────────────────────────────────────────────
interface ProminentCreateButtonProps {
  onClick: () => void
}

export function ProminentCreateButton({ onClick }: ProminentCreateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-jira-blue to-jira-blue-hover
                 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white
                 shadow-lg shadow-jira-blue/30
                 transition-all duration-200 hover:shadow-xl hover:shadow-jira-blue/40 hover:-translate-y-0.5
                 focus-visible:outline-2 focus-visible:outline-jira-blue focus-visible:outline-offset-2"
    >
      <Plus className="h-5 w-5" strokeWidth={2.5} />
      Create Organization
    </button>
  )
}
