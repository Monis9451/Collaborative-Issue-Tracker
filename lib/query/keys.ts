/**
 * Centralized TanStack Query key factory.
 *
 * Using a single object to define all keys ensures:
 *  - Consistent cache invalidation across hooks and mutations
 *  - Easy to invalidate a whole "domain" (e.g. all ticket queries)
 *  - No magic strings scattered across the codebase
 *
 * Convention:
 *   queryKeys.domain.all          → ['domain']            (invalidate everything in domain)
 *   queryKeys.domain.lists()      → ['domain', 'list']    (all list queries)
 *   queryKeys.domain.list(params) → ['domain', 'list', params]
 *   queryKeys.domain.detail(id)   → ['domain', 'detail', id]
 */
export const queryKeys = {
  // ── Current user ──────────────────────────────────────────
  user: {
    all:    () => ['user']                     as const,
    me:     () => ['user', 'me']               as const,
  },

  // ── Organizations ─────────────────────────────────────────
  orgs: {
    all:    () => ['orgs']                     as const,
    lists:  () => ['orgs', 'list']             as const,
    detail: (id: string) => ['orgs', 'detail', id] as const,
  },

  // ── Organization Members ──────────────────────────────────
  members: {
    all:    () => ['members']                               as const,
    list:   (orgId: string) => ['members', 'list', orgId]   as const,
    role:   (orgId: string) => ['members', 'role', orgId]   as const,
  },

  // ── Tickets ───────────────────────────────────────────────
  tickets: {
    all:    () => ['tickets']                                           as const,
    lists:  () => ['tickets', 'list']                                   as const,
    list:   (orgId: string, filters?: Record<string, unknown>) =>
              ['tickets', 'list', orgId, filters ?? {}]                 as const,
    detail: (id: string) => ['tickets', 'detail', id]                  as const,
  },

  // ── Ticket Comments ───────────────────────────────────────
  comments: {
    all:    () => ['comments']                                          as const,
    list:   (ticketId: string) => ['comments', 'list', ticketId]       as const,
  },
} as const
