-- Patch 002: SECURITY DEFINER RPC functions for tickets/comments


-- ──────────────────────────────────────────────────────────────
-- create_ticket
-- Any org member can create a ticket.
-- ──────────────────────────────────────────────────────────────
create or replace function public.create_ticket(
  p_org_id      uuid,
  p_title       text,
  p_description text            default null,
  p_priority    ticket_priority default 'medium',
  p_assignee_id uuid            default null,
  p_due_date    date            default null,
  p_tags        text[]          default '{}'
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.tickets;
begin
  -- Caller must be a member of the org
  if not public.is_org_member(p_org_id) then
    raise exception 'Not a member of this organization';
  end if;

  insert into public.tickets (
    organization_id, created_by, assignee_id,
    title, description, priority, due_date, tags
  ) values (
    p_org_id, auth.uid(), p_assignee_id,
    p_title, p_description, p_priority, p_due_date, p_tags
  )
  returning * into v_ticket;

  return row_to_json(v_ticket);
end;
$$;

-- update_ticket
create or replace function public.update_ticket(
  p_ticket_id   uuid,
  p_title       text,
  p_description text,              -- nullable, pass null to clear
  p_priority    ticket_priority,
  p_assignee_id uuid,              -- nullable, pass null to unassign
  p_due_date    date,              -- nullable, pass null to clear
  p_tags        text[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.tickets;
  v_org_id uuid;
  v_created_by uuid;
  v_assignee_id uuid;
begin
  -- Load current ticket to get org_id and ownership
  select organization_id, created_by, assignee_id
  into   v_org_id, v_created_by, v_assignee_id
  from   public.tickets
  where  id = p_ticket_id and deleted_at is null;

  if not found then
    raise exception 'Ticket not found';
  end if;

  -- RBAC: admin can update any; member can update own / assigned
  if not (
    public.is_org_admin(v_org_id)
    or (public.is_org_member(v_org_id) and v_created_by  = auth.uid())
    or (public.is_org_member(v_org_id) and v_assignee_id = auth.uid())
  ) then
    raise exception 'Not authorized to update this ticket';
  end if;

  update public.tickets
  set
    title       = p_title,
    description = p_description,
    priority    = p_priority,
    assignee_id = p_assignee_id,
    due_date    = p_due_date,
    tags        = p_tags
  where id = p_ticket_id
  returning * into v_ticket;

  return row_to_json(v_ticket);
end;
$$;

-- update_ticket_status
create or replace function public.update_ticket_status(
  p_ticket_id uuid,
  p_status    ticket_status
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket      public.tickets;
  v_org_id      uuid;
  v_created_by  uuid;
  v_assignee_id uuid;
begin
  select organization_id, created_by, assignee_id
  into   v_org_id, v_created_by, v_assignee_id
  from   public.tickets
  where  id = p_ticket_id and deleted_at is null;

  if not found then
    raise exception 'Ticket not found';
  end if;

  if not (
    public.is_org_admin(v_org_id)
    or (public.is_org_member(v_org_id) and v_created_by  = auth.uid())
    or (public.is_org_member(v_org_id) and v_assignee_id = auth.uid())
  ) then
    raise exception 'Not authorized to update this ticket';
  end if;

  update public.tickets
  set    status = p_status
  where  id = p_ticket_id
  returning * into v_ticket;

  return row_to_json(v_ticket);
end;
$$;


-- delete_ticket (soft-delete)
create or replace function public.delete_ticket(
  p_ticket_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id     uuid;
  v_created_by uuid;
begin
  select organization_id, created_by
  into   v_org_id, v_created_by
  from   public.tickets
  where  id = p_ticket_id and deleted_at is null;

  if not found then
    raise exception 'Ticket not found';
  end if;

  if not (
    public.is_org_admin(v_org_id)
    or (public.is_org_member(v_org_id) and v_created_by = auth.uid())
  ) then
    raise exception 'Not authorized to delete this ticket';
  end if;

  update public.tickets
  set    deleted_at = now()
  where  id = p_ticket_id;
end;
$$;


-- create_comment
create or replace function public.create_comment(
  p_ticket_id uuid,
  p_body      text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comment public.ticket_comments;
  v_org_id  uuid;
begin
  -- Resolve org_id from the ticket
  select organization_id
  into   v_org_id
  from   public.tickets
  where  id = p_ticket_id and deleted_at is null;

  if not found then
    raise exception 'Ticket not found';
  end if;

  if not public.is_org_member(v_org_id) then
    raise exception 'Not a member of this organization';
  end if;

  if p_body is null or trim(p_body) = '' then
    raise exception 'Comment body cannot be empty';
  end if;

  insert into public.ticket_comments (ticket_id, author_id, body)
  values (p_ticket_id, auth.uid(), trim(p_body))
  returning * into v_comment;

  return row_to_json(v_comment);
end;
$$;


-- delete_comment
create or replace function public.delete_comment(
  p_comment_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author_id uuid;
  v_ticket_id uuid;
  v_org_id    uuid;
begin
  select author_id, ticket_id
  into   v_author_id, v_ticket_id
  from   public.ticket_comments
  where  id = p_comment_id;

  if not found then
    raise exception 'Comment not found';
  end if;

  select organization_id
  into   v_org_id
  from   public.tickets
  where  id = v_ticket_id;

  if not (
    v_author_id = auth.uid()
    or public.is_org_admin(v_org_id)
  ) then
    raise exception 'Not authorized to delete this comment';
  end if;

  delete from public.ticket_comments where id = p_comment_id;
end;
$$;
