-- Patch 004 — Fix create_organization to insert creator as admin

-- ── 1. Replace create_organization ───────────────────────────
create or replace function public.create_organization(
  org_name text,
  org_slug text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id  uuid;
  v_org_id     uuid;
  v_org_row    json;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Insert the org
  insert into public.organizations (name, slug, created_by)
  values (org_name, org_slug, v_caller_id)
  returning id into v_org_id;

  -- Insert creator as admin member
  insert into public.organization_members
    (organization_id, user_id, role, invited_by, joined_at)
  values
    (v_org_id, v_caller_id, 'admin', null, now())
  on conflict (organization_id, user_id) do nothing;

  -- Return full org row
  select to_json(o.*) into v_org_row
  from   public.organizations o
  where  o.id = v_org_id;

  return v_org_row;
end;
$$;

grant execute on function public.create_organization(text, text) to authenticated;


-- ── 2. Backfill missing admin rows for existing orgs ─────────
insert into public.organization_members
  (organization_id, user_id, role, invited_by, joined_at)
select
  o.id          as organization_id,
  o.created_by  as user_id,
  'admin'       as role,
  null          as invited_by,
  o.created_at  as joined_at
from   public.organizations o
where  not exists (
  select 1
  from   public.organization_members m
  where  m.organization_id = o.id
    and  m.user_id         = o.created_by
)
on conflict (organization_id, user_id) do nothing;
