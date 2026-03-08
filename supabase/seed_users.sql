-- ─────────────────────────────────────────────────────────────
-- seed_users.sql — Directly inject test users into auth + profiles
--
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor).
-- This bypasses the signup email confirmation limit entirely.
--
-- Users created:
--   1. monishussainofficial@gmail.com  |  "User 1"  |  qwertyuiopQ1
--   2. extramonis@gmail.com            |  "User 2"  |  qwertyuiopQ1
--
-- Safe to re-run — uses ON CONFLICT DO NOTHING on both tables.
-- ─────────────────────────────────────────────────────────────

do $$
declare
  v_user1_id  uuid := gen_random_uuid();
  v_user2_id  uuid := gen_random_uuid();
  v_existing  uuid;
begin

  -- ── User 1 ──────────────────────────────────────────────────
  select id into v_existing
  from   auth.users
  where  email = 'monishussainofficial@gmail.com';

  if v_existing is null then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      v_user1_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'monishussainofficial@gmail.com',
      crypt('qwertyuiopQ1', gen_salt('bf')),
      now(),                                       -- pre-confirmed
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"User 1"}',
      false,
      now(),
      now(),
      '', '', '', ''
    );
  else
    v_user1_id := v_existing;
  end if;

  insert into public.profiles (id, email, full_name, created_at, updated_at)
  values (v_user1_id, 'monishussainofficial@gmail.com', 'User 1', now(), now())
  on conflict (id) do nothing;


  -- ── User 2 ──────────────────────────────────────────────────
  select id into v_existing
  from   auth.users
  where  email = 'extramonis@gmail.com';

  if v_existing is null then
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) values (
      v_user2_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'extramonis@gmail.com',
      crypt('qwertyuiopQ1', gen_salt('bf')),
      now(),                                       -- pre-confirmed
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"User 2"}',
      false,
      now(),
      now(),
      '', '', '', ''
    );
  else
    v_user2_id := v_existing;
  end if;

  insert into public.profiles (id, email, full_name, created_at, updated_at)
  values (v_user2_id, 'extramonis@gmail.com', 'User 2', now(), now())
  on conflict (id) do nothing;

end;
$$;

-- ── Verify ───────────────────────────────────────────────────
select u.email, u.email_confirmed_at, p.full_name
from   auth.users    u
join   public.profiles p on p.id = u.id
where  u.email in (
  'monishussainofficial@gmail.com',
  'extramonis@gmail.com'
)
order by u.email;
