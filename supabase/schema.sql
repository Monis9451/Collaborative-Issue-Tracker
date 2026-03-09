create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- 1. CUSTOM ENUM TYPES

-- Role a user can hold inside one organization
create type app_role as enum ('admin', 'member');

-- Lifecycle of a ticket
create type ticket_status as enum ('open', 'in_progress', 'closed');

-- Urgency/importance of a ticket
create type ticket_priority as enum ('low', 'medium', 'high');

-- 2. TABLES

create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2b. organizations
create table public.organizations (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,           -- URL-safe identifier e.g. "acme-corp"
  created_by  uuid        not null references public.profiles (id) on delete restrict,
  created_at  timestamptz not null default now()
);

-- 2c. organization_members
create table public.organization_members (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references public.organizations (id) on delete cascade,
  user_id          uuid        not null references public.profiles (id)       on delete cascade,
  role             app_role    not null default 'member',
  invited_by       uuid        references public.profiles (id) on delete set null,  -- nullable
  joined_at        timestamptz not null default now(),

  constraint uq_org_user unique (organization_id, user_id)
);

-- 2d. tickets
create table public.tickets (
  id               uuid            primary key default gen_random_uuid(),
  organization_id  uuid            not null references public.organizations (id) on delete cascade,
  created_by       uuid            not null references public.profiles (id)      on delete restrict,
  assignee_id      uuid            references public.profiles (id)               on delete set null,  -- nullable
  title            text            not null,
  description      text,
  status           ticket_status   not null default 'open',
  priority         ticket_priority not null default 'medium',
  due_date         date,
  tags             text[]          default '{}',
  comments_count   integer         not null default 0,    -- denormalized counter, kept in sync by trigger
  created_at       timestamptz     not null default now(),
  updated_at       timestamptz     not null default now(),
  deleted_at       timestamptz                            -- NULL = active; NOT NULL = soft-deleted
);

-- Index to quickly filter tickets by org and exclude soft-deleted rows
create index idx_tickets_org_active  on public.tickets (organization_id) where deleted_at is null;
create index idx_tickets_assignee    on public.tickets (assignee_id)    where deleted_at is null;
create index idx_tickets_status      on public.tickets (organization_id, status) where deleted_at is null;

-- 2e. ticket_comments
create table public.ticket_comments (
  id          uuid        primary key default gen_random_uuid(),
  ticket_id   uuid        not null references public.tickets (id) on delete cascade,
  author_id   uuid        not null references public.profiles (id) on delete cascade,
  body        text        not null,
  created_at  timestamptz not null default now()
);

create index idx_comments_ticket on public.ticket_comments (ticket_id);

-- 3. UTILITY FUNCTIONS
create or replace function public.get_user_role(org_id uuid)
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from   public.organization_members
  where  organization_id = org_id
  and    user_id         = auth.uid()
  limit  1;
$$;

-- Returns TRUE if the calling user is ANY member of the org.
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from   public.organization_members
    where  organization_id = org_id
    and    user_id         = auth.uid()
  );
$$;

-- Returns TRUE if the calling user is an ADMIN of the org.
create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from   public.organization_members
    where  organization_id = org_id
    and    user_id         = auth.uid()
    and    role            = 'admin'
  );
$$;


-- 4. TRIGGERS
-- 4a. Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;   -- idempotent: safe to re-run
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4b. Keep updated_at current on profiles and tickets
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_tickets_updated_at
  before update on public.tickets
  for each row execute procedure public.set_updated_at();


-- 4c. Keep tickets.comments_count in sync automatically
create or replace function public.update_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update public.tickets
    set    comments_count = comments_count + 1
    where  id = new.ticket_id;

  elsif TG_OP = 'DELETE' then
    update public.tickets
    set    comments_count = greatest(comments_count - 1, 0)
    where  id = old.ticket_id;
  end if;

  return null;
end;
$$;

create trigger trg_comments_count
  after insert or delete on public.ticket_comments
  for each row execute procedure public.update_comments_count();

-- 5. ROW LEVEL SECURITY (RLS)

alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.tickets              enable row level security;
alter table public.ticket_comments      enable row level security;

-- profiles policies

-- Any authenticated user can view profiles
-- (needed to show assignee names, member lists, etc.)
create policy "profiles: authenticated users can read all"
  on public.profiles for select
  to authenticated
  using (true);

-- A user can only insert their own profile row
create policy "profiles: users insert own row"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

-- A user can only update their own profile
create policy "profiles: users update own row"
  on public.profiles for update
  to authenticated
  using  (id = auth.uid())
  with check (id = auth.uid());


-- organizations policies

-- Only members of an org can see it
create policy "orgs: members can read"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

-- Any authenticated user can create an org
create policy "orgs: authenticated users can create"
  on public.organizations for insert
  to authenticated
  with check (created_by = auth.uid());

-- Only admins can update org info (name, slug)
create policy "orgs: admins can update"
  on public.organizations for update
  to authenticated
  using  (public.is_org_admin(id))
  with check (public.is_org_admin(id));

-- Only admins can delete an org
create policy "orgs: admins can delete"
  on public.organizations for delete
  to authenticated
  using (public.is_org_admin(id));

-- organization_members policies

-- All members of an org can see the member list
create policy "members: org members can read"
  on public.organization_members for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Admins can add new members  OR  the very first row (creator bootstrapping)
-- The OR clause allows the creator to insert themselves as admin right after creating the org.
create policy "members: admins can insert"
  on public.organization_members for insert
  to authenticated
  with check (
    public.is_org_admin(organization_id)
    or
    -- Allow a user to insert themselves as admin when the org has no members yet
    (
      user_id = auth.uid()
      and role = 'admin'
      and not exists (
        select 1 from public.organization_members
        where organization_id = organization_members.organization_id
      )
    )
  );

-- Admins can update roles of existing members
create policy "members: admins can update roles"
  on public.organization_members for update
  to authenticated
  using  (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

-- Admins can remove members
create policy "members: admins can delete"
  on public.organization_members for delete
  to authenticated
  using (public.is_org_admin(organization_id));

-- tickets policies

-- Any org member can read non-deleted tickets in their org
create policy "tickets: org members can read"
  on public.tickets for select
  to authenticated
  using (
    public.is_org_member(organization_id)
    and deleted_at is null
  );

-- Any org member can create tickets (their org only)
-- assignee_id must be NULL or a member of the same org
create policy "tickets: org members can create"
  on public.tickets for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    and created_by = auth.uid()
    and (
      assignee_id is null
      or exists (
        select 1 from public.organization_members om
        where om.organization_id = tickets.organization_id
        and   om.user_id         = assignee_id
      )
    )
  );

-- Admins can update any ticket; members can only update tickets assigned to them
-- In both cases the new assignee_id (if set) must be a member of the same org
create policy "tickets: update — admin full, member own"
  on public.tickets for update
  to authenticated
  using (
    -- checks OLD row: who is allowed to attempt the update
    public.is_org_admin(organization_id)
    or
    (public.is_org_member(organization_id) and assignee_id = auth.uid())
  )
  with check (
    -- checks NEW row: role rule still satisfied after the edit
    (
      public.is_org_admin(organization_id)
      or
      (public.is_org_member(organization_id) and assignee_id = auth.uid())
    )
    -- new assignee_id must be an org member (or left unassigned)
    and (
      assignee_id is null
      or exists (
        select 1 from public.organization_members om
        where om.organization_id = tickets.organization_id
        and   om.user_id         = assignee_id
      )
    )
  );

-- Only admins can hard-delete tickets
create policy "tickets: delete — admins only"
  on public.tickets for delete
  to authenticated
  using (public.is_org_admin(organization_id));

-- ticket_comments policies

-- Any org member of the parent ticket's org can read comments
create policy "comments: org members can read"
  on public.ticket_comments for select
  to authenticated
  using (
    exists (
      select 1 from public.tickets t
      where  t.id = ticket_id
      and    public.is_org_member(t.organization_id)
      and    t.deleted_at is null
    )
  );

-- Any org member can post a comment
create policy "comments: org members can create"
  on public.ticket_comments for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tickets t
      where  t.id = ticket_id
      and    public.is_org_member(t.organization_id)
      and    t.deleted_at is null
    )
  );

-- Authors can edit their own comments; admins can edit any comment
-- WITH CHECK ensures author_id cannot be reassigned after the fact.
create policy "comments: author or admin can update"
  on public.ticket_comments for update
  to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.tickets t
      where t.id = ticket_id
      and   public.is_org_admin(t.organization_id)
    )
  )
  with check (
    author_id = auth.uid()
    or exists (
      select 1 from public.tickets t
      where t.id = ticket_id
      and   public.is_org_admin(t.organization_id)
    )
  );

-- Authors can delete their own comments; admins can delete any comment
create policy "comments: author or admin can delete"
  on public.ticket_comments for delete
  to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.tickets t
      where t.id = ticket_id
      and   public.is_org_admin(t.organization_id)
    )
  );


-- 6. REALTIME

-- Add tickets and ticket_comments to the realtime publication
alter publication supabase_realtime add table public.tickets;
alter publication supabase_realtime add table public.ticket_comments;
