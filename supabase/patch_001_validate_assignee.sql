-- =============================================================
-- PATCH: Validate assignee_id belongs to the same organization
-- =============================================================
-- Run this in Supabase SQL Editor AFTER the initial schema.sql
--
-- Problem: The original INSERT and UPDATE policies allowed
-- assignee_id to be any UUID, including users outside the org.
--
-- Fix: Both policies now include a WITH CHECK clause that
-- ensures assignee_id is either NULL or exists as a member
-- of the ticket's organization.
-- =============================================================


-- ── 1. Fix the INSERT (create ticket) policy ─────────────────

drop policy if exists "tickets: org members can create" on public.tickets;

create policy "tickets: org members can create"
  on public.tickets for insert
  to authenticated
  with check (
    -- caller must be a member of this org
    public.is_org_member(organization_id)
    -- they must be setting themselves as creator
    and created_by = auth.uid()
    -- assignee must be in the same org (or left unassigned)
    and (
      assignee_id is null
      or exists (
        select 1 from public.organization_members om
        where om.organization_id = tickets.organization_id
        and   om.user_id         = assignee_id
      )
    )
  );


-- ── 2. Fix the UPDATE (edit ticket) policy ───────────────────
-- Same gap exists here: an admin could reassign a ticket to an
-- outsider.  The WITH CHECK now validates the new assignee_id.

drop policy if exists "tickets: update — admin full, member own" on public.tickets;

create policy "tickets: update — admin full, member own"
  on public.tickets for update
  to authenticated
  using (
    -- who is allowed to attempt the update (checks OLD row)
    public.is_org_admin(organization_id)
    or
    (public.is_org_member(organization_id) and assignee_id = auth.uid())
  )
  with check (
    -- the NEW row must still satisfy role rules ...
    (
      public.is_org_admin(organization_id)
      or
      (public.is_org_member(organization_id) and assignee_id = auth.uid())
    )
    -- ... AND the new assignee_id (if set) must be an org member
    and (
      assignee_id is null
      or exists (
        select 1 from public.organization_members om
        where om.organization_id = tickets.organization_id
        and   om.user_id         = assignee_id
      )
    )
  );
