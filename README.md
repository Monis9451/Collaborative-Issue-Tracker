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