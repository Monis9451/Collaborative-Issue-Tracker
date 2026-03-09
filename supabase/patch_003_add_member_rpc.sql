-- Patch 003 — add_org_member RPC

create or replace function public.add_org_member(
  p_email  text,
  p_org_id text
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id   uuid;
  v_caller_role text;
  v_target_id   uuid;
  v_new_row     json;
begin
  -- 1. Who is calling?
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'not_authenticated';
  end if;

  -- 2. Check caller is admin of this org
  select role into v_caller_role
  from   public.organization_members
  where  organization_id = p_org_id::uuid
    and  user_id         = v_caller_id;

  if v_caller_role is distinct from 'admin' then
    raise exception 'not_admin';
  end if;

  -- 3. Look up the target user by email in profiles
  select id into v_target_id
  from   public.profiles
  where  lower(email) = lower(trim(p_email))
  limit  1;

  if v_target_id is null then
    raise exception 'user_not_found';
  end if;

  -- 4. Already a member?
  if exists (
    select 1 from public.organization_members
    where organization_id = p_org_id::uuid
      and user_id         = v_target_id
  ) then
    raise exception 'already_member';
  end if;

  -- 5. Insert
  insert into public.organization_members
    (organization_id, user_id, role, invited_by, joined_at)
  values
    (p_org_id::uuid, v_target_id, 'member', v_caller_id, now())
  returning to_json(organization_members.*) into v_new_row;

  return v_new_row;
end;
$$;

-- Only authenticated users can call this (the function itself enforces admin check)
grant execute on function public.add_org_member(text, text) to authenticated;
