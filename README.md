# Collaborative Issue Tracker

## Live Deployment
https://collaborative-issue-tracker-sigma.vercel.app

## Test Accounts

| Role             | Email                             | Password     |
|------------------|-----------------------------------|--------------|
| Admin            | monishussainofficial@gmail.com    | qwertyuiopQ1 |
| Member           | extramonis@gmail.com              | qwertyuiopQ1 |
| User with no Org | mianmonishussain786@gmail.com     | qwertyuiopQ1 |
## Run Locally

Run the following in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

## Environment Variables

Create a `.env.local` file in the project root and add the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find both values in your Supabase project under **Project Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> `.env.local` is gitignored — never commit it.

## Run Locally

### 1. Clone & install

```bash
git clone https://github.com/Monis9451/Collaborative-Issue-Tracker.git
cd Collaborative-Issue-Tracker/cit
npm install
```

### 2. Add environment variables

Create `.env.local` in the project root with the variables listed above.

### 3. Set up the database

Run the following in the **Supabase SQL Editor** (Dashboard → SQL Editor → New query).

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Tables, Enums & Triggers

```sql
create extension if not exists "pgcrypto";

create type app_role       as enum ('admin', 'member');
create type ticket_status  as enum ('open', 'in_progress', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high');

create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.organizations (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  created_by  uuid        not null references public.profiles (id) on delete restrict,
  created_at  timestamptz not null default now()
);

create table public.organization_members (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        not null references public.organizations (id) on delete cascade,
  user_id          uuid        not null references public.profiles (id)       on delete cascade,
  role             app_role    not null default 'member',
  invited_by       uuid        references public.profiles (id) on delete set null,
  joined_at        timestamptz not null default now(),
  constraint uq_org_user unique (organization_id, user_id)
);

create table public.tickets (
  id               uuid            primary key default gen_random_uuid(),
  organization_id  uuid            not null references public.organizations (id) on delete cascade,
  created_by       uuid            not null references public.profiles (id)      on delete restrict,
  assignee_id      uuid            references public.profiles (id)               on delete set null,
  title            text            not null,
  description      text,
  status           ticket_status   not null default 'open',
  priority         ticket_priority not null default 'medium',
  due_date         date,
  tags             text[]          default '{}',
  comments_count   integer         not null default 0,
  created_at       timestamptz     not null default now(),
  updated_at       timestamptz     not null default now(),
  deleted_at       timestamptz
);

create index idx_tickets_org_active on public.tickets (organization_id) where deleted_at is null;
create index idx_tickets_assignee   on public.tickets (assignee_id)     where deleted_at is null;
create index idx_tickets_status     on public.tickets (organization_id, status) where deleted_at is null;

create table public.ticket_comments (
  id          uuid        primary key default gen_random_uuid(),
  ticket_id   uuid        not null references public.tickets (id) on delete cascade,
  author_id   uuid        not null references public.profiles (id) on delete cascade,
  body        text        not null,
  created_at  timestamptz not null default now()
);

create index idx_comments_ticket on public.ticket_comments (ticket_id);
```

### Row Level Security (RLS) Policies

```sql
alter table public.profiles             enable row level security;
alter table public.organizations        enable row level security;
alter table public.organization_members enable row level security;
alter table public.tickets              enable row level security;
alter table public.ticket_comments      enable row level security;

-- profiles
create policy "profiles: authenticated users can read all"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: users insert own row"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: users update own row"
  on public.profiles for update
  to authenticated
  using  (id = auth.uid())
  with check (id = auth.uid());

-- organizations
create policy "orgs: members can read"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

create policy "orgs: authenticated users can create"
  on public.organizations for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "orgs: admins can update"
  on public.organizations for update
  to authenticated
  using  (public.is_org_admin(id))
  with check (public.is_org_admin(id));

create policy "orgs: admins can delete"
  on public.organizations for delete
  to authenticated
  using (public.is_org_admin(id));

-- organization_members
create policy "members: org members can read"
  on public.organization_members for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "members: admins can insert"
  on public.organization_members for insert
  to authenticated
  with check (
    public.is_org_admin(organization_id)
    or
    (
      user_id = auth.uid()
      and role = 'admin'
      and not exists (
        select 1 from public.organization_members
        where organization_id = organization_members.organization_id
      )
    )
  );

create policy "members: admins can update roles"
  on public.organization_members for update
  to authenticated
  using  (public.is_org_admin(organization_id))
  with check (public.is_org_admin(organization_id));

create policy "members: admins can delete"
  on public.organization_members for delete
  to authenticated
  using (public.is_org_admin(organization_id));

-- tickets
create policy "tickets: org members can read"
  on public.tickets for select
  to authenticated
  using (
    public.is_org_member(organization_id)
    and deleted_at is null
  );

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

create policy "tickets: update — admin full, member own"
  on public.tickets for update
  to authenticated
  using (
    public.is_org_admin(organization_id)
    or
    (public.is_org_member(organization_id) and assignee_id = auth.uid())
  )
  with check (
    (
      public.is_org_admin(organization_id)
      or
      (public.is_org_member(organization_id) and assignee_id = auth.uid())
    )
    and (
      assignee_id is null
      or exists (
        select 1 from public.organization_members om
        where om.organization_id = tickets.organization_id
        and   om.user_id         = assignee_id
      )
    )
  );

create policy "tickets: delete — admins only"
  on public.tickets for delete
  to authenticated
  using (public.is_org_admin(organization_id));

-- ticket_comments
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
