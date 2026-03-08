-- =============================================================
-- Seed Data for Local Development & README Demo Accounts
-- =============================================================
-- HOW TO USE:
--   1. Go to Supabase Dashboard → Authentication → Users
--   2. Click "Add user" → Create TWO users manually:
--        Admin : admin@dev.com   / password: Admin1234!
--        Member: member@dev.com  / password: Member1234!
--   3. Copy the UUID Supabase assigns to each user.
--   4. Replace the two placeholder UUIDs below with those real UUIDs.
--   5. Run this file in Supabase SQL Editor.
-- =============================================================

-- Replace these with the actual UUIDs from the Auth dashboard
do $$
declare
  v_admin_id   uuid := '6cd8c880-b4d1-41bf-a508-50169465fb12';
  v_member_id  uuid := '9a61b728-471c-4f64-bbed-9f24a58561fd';
  v_org_id     uuid := gen_random_uuid();
  v_ticket1    uuid := gen_random_uuid();
  v_ticket2    uuid := gen_random_uuid();
  v_ticket3    uuid := gen_random_uuid();
  v_ticket4    uuid := gen_random_uuid();
begin

  -- ----------------------------------------------------------
  -- Profiles (normally auto-created by the trigger on sign-up;
  -- include here in case you're running seed before first login)
  -- ----------------------------------------------------------
  insert into public.profiles (id, email, full_name, avatar_url)
  values
    (v_admin_id,  'admin@dev.com',  'Alex Admin',   null),
    (v_member_id, 'member@dev.com', 'Sam Member',   null)
  on conflict (id) do update
    set full_name = excluded.full_name;


  -- ----------------------------------------------------------
  -- Organization
  -- ----------------------------------------------------------
  insert into public.organizations (id, name, slug, created_by)
  values (v_org_id, 'Demo Corp', 'demo-corp', v_admin_id);


  -- ----------------------------------------------------------
  -- Org members — admin first so RLS policies can use get_user_role
  -- ----------------------------------------------------------
  insert into public.organization_members (organization_id, user_id, role, invited_by)
  values
    (v_org_id, v_admin_id,  'admin',  null),          -- creator = admin
    (v_org_id, v_member_id, 'member', v_admin_id);    -- invited by admin


  -- ----------------------------------------------------------
  -- Tickets
  -- ----------------------------------------------------------
  insert into public.tickets
    (id, organization_id, created_by, assignee_id, title, description, status, priority, tags)
  values
    (
      v_ticket1, v_org_id, v_admin_id, v_member_id,
      'Fix login redirect bug',
      'After successful login the user is sometimes redirected to / instead of /tickets.',
      'open', 'high',
      '{bug, auth}'
    ),
    (
      v_ticket2, v_org_id, v_admin_id, v_admin_id,
      'Set up CI/CD pipeline',
      'Configure GitHub Actions to run lint + tests on every PR and auto-deploy to Vercel.',
      'in_progress', 'medium',
      '{devops}'
    ),
    (
      v_ticket3, v_org_id, v_member_id, null,
      'Write onboarding documentation',
      'Create a /docs page covering registration, org creation, and ticket management.',
      'open', 'low',
      '{docs}'
    ),
    (
      v_ticket4, v_org_id, v_admin_id, v_member_id,
      'Add dark mode support',
      'Implement a theme toggle and persist choice in localStorage.',
      'closed', 'low',
      '{ui, enhancement}'
    );

end $$;
