// =============================================================
// Supabase Database TypeScript Types
// Generated to match schema.sql exactly.
// Keep this in sync if you alter tables.
// =============================================================

export type AppRole       = 'admin' | 'member'
export type TicketStatus  = 'open'  | 'in_progress' | 'closed'
export type TicketPriority = 'low'  | 'medium'       | 'high'

// ── profiles ─────────────────────────────────────────────────
export interface Profile {
  id:          string         // uuid, = auth.users.id
  email:       string
  full_name:   string | null
  avatar_url:  string | null
  created_at:  string
  updated_at:  string
}

// ── organizations ────────────────────────────────────────────
export interface Organization {
  id:          string
  name:        string
  slug:        string
  created_by:  string        // FK → profiles.id
  created_at:  string
}

// ── organization_members ─────────────────────────────────────
export interface OrgMember {
  id:               string
  organization_id:  string   // FK → organizations.id
  user_id:          string   // FK → profiles.id
  role:             AppRole
  invited_by:       string | null  // FK → profiles.id (nullable)
  joined_at:        string
}

// ── tickets ──────────────────────────────────────────────────
export interface Ticket {
  id:               string
  organization_id:  string         // FK → organizations.id
  created_by:       string         // FK → profiles.id
  assignee_id:      string | null  // FK → profiles.id (nullable)
  title:            string
  description:      string | null
  status:           TicketStatus
  priority:         TicketPriority
  due_date:         string | null  // ISO date e.g. "2026-03-31"
  tags:             string[]
  comments_count:   number
  created_at:       string
  updated_at:       string
  deleted_at:       string | null  // null = active, not null = soft-deleted
}

// ── ticket_comments ───────────────────────────────────────────
export interface TicketComment {
  id:          string
  ticket_id:   string  // FK → tickets.id
  author_id:   string  // FK → profiles.id
  body:        string
  created_at:  string
}

// ── Joined / enriched types used by the UI ───────────────────

/** Ticket with nested profile objects (from Supabase joins) */
export interface TicketWithProfiles extends Ticket {
  assignee:   Profile | null
  creator:    Profile
}

/** Org member with nested profile */
export interface OrgMemberWithProfile extends OrgMember {
  profile: Profile
}

// ── Supabase Database type map (for createClient<Database>()) ─
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row:    Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      organizations: {
        Row:    Organization
        Insert: Omit<Organization, 'id' | 'created_at'>
        Update: Partial<Pick<Organization, 'name' | 'slug'>>
      }
      organization_members: {
        Row:    OrgMember
        Insert: Omit<OrgMember, 'id' | 'joined_at'>
        Update: Pick<OrgMember, 'role'>
      }
      tickets: {
        Row:    Ticket
        Insert: Omit<Ticket, 'id' | 'comments_count' | 'created_at' | 'updated_at' | 'deleted_at'>
        Update: Partial<Omit<Ticket, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>>
      }
      ticket_comments: {
        Row:    TicketComment
        Insert: Omit<TicketComment, 'id' | 'created_at'>
        Update: Pick<TicketComment, 'body'>
      }
    }
    Enums: {
      app_role:        AppRole
      ticket_status:   TicketStatus
      ticket_priority: TicketPriority
    }
  }
}
