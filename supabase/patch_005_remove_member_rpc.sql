-- Patch 005 — remove_org_member RPC

create or replace function public.remove_org_member(
  p_member_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id   uuid;
  v_org_id      uuid;
  v_target_uid  uuid;
  v_target_role text;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Fetch the target membership row
  select organization_id, user_id, role
  into   v_org_id, v_target_uid, v_target_role
  from   public.organization_members
  where  id = p_member_id::uuid;

  if v_org_id is null then
    raise exception 'member_not_found';
  end if;

  -- Caller must be admin of that org
  if not exists (
    select 1 from public.organization_members
    where  organization_id = v_org_id
      and  user_id         = v_caller_id
      and  role            = 'admin'
  ) then
    raise exception 'not_admin';
  end if;

  -- Cannot remove yourself
  if v_target_uid = v_caller_id then
    raise exception 'cannot_remove_self';
  end if;

  -- Cannot remove another admin
  if v_target_role = 'admin' then
    raise exception 'cannot_remove_admin';
  end if;

  -- All good — delete
  delete from public.organization_members
  where id = p_member_id::uuid;
end;
$$;

grant execute on function public.remove_org_member(text) to authenticated;
