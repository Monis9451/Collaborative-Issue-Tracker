# Agent Implementation Rules

This document defines the strict rules, architecture patterns, and technical constraints that must be followed throughout every implementation task in this project. Read and adhere to all sections before writing any code.

---

## 1. Project Overview

Build a **Collaborative Issue Tracker** — a secure, role-based issue-tracking dashboard using:

- **Framework:** Next.js (App Router only — no Pages Router)
- **Backend/Database:** Supabase (Auth + PostgreSQL + RLS + Realtime)
- **Styling:** Tailwind CSS
- **Server State:** TanStack Query (`@tanstack/react-query`)

---

## 2. Component Architecture

> **Rule: Never dump all UI code into a single file.**

- Break every page into small, focused, reusable components.
- Each component must have a **single responsibility**.
- Co-locate components with their feature when they are feature-specific. Shared/generic components live in `components/ui/`.
- Logical directory structure example:
  ```
  components/
    ui/            # Generic, reusable primitives (Button, Badge, Modal, etc.)
    auth/          # Login form, Register form
    dashboard/
      tickets/     # TicketCard, TicketTable, TicketForm, TicketStatusBadge
      kanban/      # KanbanBoard, KanbanColumn, KanbanCard
      org/         # OrgSettings, MemberList, InviteForm
      sidebar/     # Sidebar, NavItem
      layout/      # DashboardLayout, DashboardHeader
  ```
- Pages in `app/` must only **compose** components. Business logic belongs in hooks or server actions, not in page files.
- Extract repetitive UI fragments immediately — do not copy-paste JSX blocks.

---

## 3. Database Schema Requirements

Design and implement a **relational schema** in Supabase with the following tables:

### `users`
- Linked to `auth.users` via `id` (UUID, foreign key).
- Fields: `id`, `email`, `full_name`, `avatar_url`, `created_at`.

### `organizations`
- Fields: `id`, `name`, `created_at`, `created_by` (FK → `users.id`).

### `organization_members` (mapping table)
- Fields: `id`, `organization_id` (FK → `organizations.id`), `user_id` (FK → `users.id`), `role` (`admin` | `member`), `joined_at`.
- Unique constraint on `(organization_id, user_id)`.

### `tickets`
- Fields: `id`, `title`, `description`, `status` (`open` | `in_progress` | `closed`), `priority` (`low` | `medium` | `high`), `organization_id` (FK → `organizations.id`), `assignee_id` (FK → `users.id`, nullable), `created_by` (FK → `users.id`), `created_at`, `updated_at`.

Use `CHECK` constraints for `status` and `priority` enum values.

---

## 4. Row Level Security (RLS) — Critical

> **RLS must be enabled on every table. No table should be publicly accessible without a policy.**

### General Rule
A user can only interact with data that belongs to an organization they are a member of.

### Policy Matrix

| Table | Operation | Who | Condition |
|---|---|---|---|
| `tickets` | SELECT | Any member | `organization_id` is one the user belongs to |
| `tickets` | INSERT | Any member | `organization_id` is one the user belongs to |
| `tickets` | UPDATE | Admin | Any ticket in their org |
| `tickets` | UPDATE | Member | Only tickets where `assignee_id = auth.uid()` |
| `tickets` | DELETE | Admin only | Any ticket in their org |
| `tickets` | DELETE | Member | **Denied** |
| `organizations` | SELECT | Member/Admin | Only orgs they belong to |
| `organization_members` | SELECT | Member/Admin | Only their own org |
| `organization_members` | INSERT/DELETE | Admin only | Within their org |

### Implementation Notes
- Use a helper function `get_user_role(org_id uuid)` returning `text` to avoid repeating subqueries in multiple policies.
- Use `SECURITY DEFINER` functions when cross-table checks are needed to avoid RLS recursion.
- Test every policy explicitly — do not assume it works.

---

## 5. Authentication & Route Protection

- Use Supabase Auth with **Email/Password**.
- All `/dashboard` routes must be protected server-side using Supabase SSR helpers.
- Unauthenticated users must be **redirected to `/login`** — not shown an error.
- After login/registration, redirect to `/dashboard`.
- Use Next.js **middleware** (`middleware.ts`) to protect routes at the edge.
- Never expose sensitive session data to the client unnecessarily.

---

## 6. TanStack Query — Strict Usage Rules

> **Do not use `useEffect` for data fetching. Do not use raw `useState` for server state.**

### Setup
- Wrap the app in `QueryClientProvider` inside a **Client Component** provider (e.g., `components/providers/QueryProvider.tsx`).
- Use `getQueryClient()` pattern for server-side prefetching where applicable.

### Fetching
- Use `useQuery` for:
  - Fetching the list of tickets
  - Fetching a single ticket's details
  - Fetching the current user's profile and role
  - Fetching organization members
- Define all query keys in a centralized file: `lib/query/keys.ts`.

### Mutations
- Use `useMutation` for:
  - Creating a ticket
  - Updating a ticket (status, priority, assignee, etc.)
  - Deleting a ticket
  - Inviting/removing organization members
- Always call `queryClient.invalidateQueries()` in `onSuccess` to keep the cache fresh.

### Optimistic Updates (Bonus)
- Implement optimistic updates for **Kanban status changes** using `onMutate`, `onError` (rollback), and `onSettled`.
- Cache the previous state before mutation and restore it on failure.

---

## 7. Role-Based UI (RBAC)

> **Do not rely solely on RLS for UI visibility. Conditionally render elements based on role.**

- Fetch the current user's role for the active organization via `useQuery`.
- **Hide from Members:**
  - "Delete Ticket" button
  - "Organization Settings" tab/page
  - Invite/remove member controls
- **Show for Admins only:**
  - All of the above
  - Ability to edit any ticket (not just assigned ones)
- Use a custom hook `useUserRole(orgId)` to encapsulate role-fetching logic and expose it cleanly to components.

---

## 8. User Interface Requirements

- **Layout:** Responsive sidebar + main content area.
- **Ticket Display:** Implement either:
  - A **Kanban board** (columns: Open, In Progress, Closed), or
  - A **data table** with sortable columns and filters
  - Preferably both, with a toggle.
- **Forms:** Ticket creation and edit forms must include:
  - Field validation (required fields, min/max length)
  - Error states displayed inline
  - Loading states on submit buttons (disable during mutation)
- **Loading States:** Use TanStack Query's `isLoading` and `isFetching` to show skeleton loaders or spinners — not blank screens.
- **Empty States:** Show meaningful empty state UI when there are no tickets.
- All components must be **mobile-responsive** using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).

---

## 9. Real-time Updates (Bonus)

- Subscribe to Supabase Realtime on the `tickets` table for `INSERT`, `UPDATE`, `DELETE` events.
- On any event, call `queryClient.invalidateQueries({ queryKey: ticketKeys.list(orgId) })` to trigger a refetch.
- This means if an Admin deletes a ticket, it disappears from a Member's screen without a manual refresh.
- Clean up subscriptions in `useEffect` return functions or in `useQuery`'s `unsubscribe` pattern.

---

## 10. Code Quality Rules

- **TypeScript strictly:** No `any` types. Define proper interfaces/types, preferably generated from the Supabase schema in `types/database.ts`.
- **No inline styles:** Use Tailwind classes exclusively.
- **No business logic in JSX:** Extract to hooks (`hooks/`) or utility functions (`lib/`).
- **Consistent naming:**
  - Components: `PascalCase`
  - Hooks: `use` prefix, `camelCase`
  - Files: `kebab-case` for non-component files, `PascalCase.tsx` for components
- **Error handling:** Every `useQuery` and `useMutation` must handle error states and display user-friendly messages.
- **No commented-out code** should be left in production files.
- **Imports:** Use absolute path aliases (`@/components/...`, `@/lib/...`, `@/hooks/...`).

---

## 11. File & Folder Conventions

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    dashboard/
      page.tsx              # Composes dashboard components only
      tickets/
        [id]/page.tsx
  api/
    auth/callback/route.ts

components/
  auth/
  dashboard/
    tickets/
    kanban/
    org/
    sidebar/
  ui/
  providers/
    QueryProvider.tsx

hooks/
  useUserRole.ts
  useTickets.ts
  useOrganization.ts

lib/
  supabase/
    client.ts
    server.ts
  query/
    client.tsx
    keys.ts
  utils.ts

types/
  database.ts
  index.ts

supabase/
  schema.sql
  seed.sql
```

---

## Summary Checklist

Before marking any feature complete, verify:

- [ ] Page files only compose components — no inline UI logic
- [ ] RLS policies are in place and tested for every table
- [ ] All data fetching uses `useQuery`, not `useEffect`
- [ ] All mutations use `useMutation` with cache invalidation
- [ ] Role-based UI elements are conditionally rendered
- [ ] Forms have validation and error/loading states
- [ ] TypeScript types are strict — no `any`
- [ ] Routes are protected via middleware
- [ ] Real-time subscription invalidates TanStack Query cache (bonus)
- [ ] Optimistic updates implemented for Kanban status changes (bonus)
