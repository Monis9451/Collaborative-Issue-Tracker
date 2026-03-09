-- Patch 006 — delete_organization RPC

create or replace function public.delete_organization(
  p_org_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id  uuid;
  v_org_exists boolean;
begin
  v_caller_id := auth.uid();
  if v_caller_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Check org exists
  select exists(
    select 1 from public.organizations where id = p_org_id::uuid
  ) into v_org_exists;

  if not v_org_exists then
    raise exception 'org_not_found';
  end if;

  -- Caller must be admin of that org
  if not exists (
    select 1 from public.organization_members
    where  organization_id = p_org_id::uuid
      and  user_id         = v_caller_id
      and  role            = 'admin'
  ) then
    raise exception 'not_admin';
  end if;

  -- Delete the org — cascade handles tickets, comments, members
  delete from public.organizations
  where  id = p_org_id::uuid;
end;
$$;

grant execute on function public.delete_organization(text) to authenticated;
