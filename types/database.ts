// =============================================================
// Supabase Database TypeScript Types
// Generated to match schema.sql exactly.
// Keep this in sync if you alter tables.
// =============================================================

export type AppRole       = 'admin' | 'member'
export type TicketStatus  = 'open'  | 'in_progress' | 'closed'
export type TicketPriority = 'low'  | 'medium'       | 'high'
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

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
// Uses explicit optional-field format required by @supabase/supabase-js v2.98+
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:          string
          email:       string
          full_name:   string | null
          avatar_url:  string | null
          created_at:  string
          updated_at:  string
        }
        Insert: {
          id:          string
          email:       string
          full_name?:  string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?:      string
          full_name?:  string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id:         string
          name:       string
          slug:       string
          created_by: string
          created_at: string
        }
        Insert: {
          id?:        string
          name:       string
          slug:       string
          created_by: string
          created_at?: string
        }
        Update: {
          name?: string
          slug?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id:              string
          organization_id: string
          user_id:         string
          role:            AppRole
          invited_by:      string | null
          joined_at:       string
        }
        Insert: {
          id?:              string
          organization_id:  string
          user_id:          string
          role?:            AppRole
          invited_by?:      string | null
          joined_at?:       string
        }
        Update: {
          role?: AppRole
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tickets: {
        Row: {
          id:              string
          organization_id: string
          created_by:      string
          assignee_id:     string | null
          title:           string
          description:     string | null
          status:          TicketStatus
          priority:        TicketPriority
          due_date:        string | null
          tags:            string[]
          comments_count:  number
          created_at:      string
          updated_at:      string
          deleted_at:      string | null
        }
        Insert: {
          id?:              string
          organization_id:  string
          created_by:       string
          assignee_id?:     string | null
          title:            string
          description?:     string | null
          status?:          TicketStatus
          priority?:        TicketPriority
          due_date?:        string | null
          tags?:            string[]
          comments_count?:  number
          created_at?:      string
          updated_at?:      string
          deleted_at?:      string | null
        }
        Update: {
          assignee_id?:  string | null
          title?:        string
          description?:  string | null
          status?:       TicketStatus
          priority?:     TicketPriority
          due_date?:     string | null
          tags?:         string[]
          deleted_at?:   string | null
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          id:         string
          ticket_id:  string
          author_id:  string
          body:       string
          created_at: string
        }
        Insert: {
          id?:        string
          ticket_id:  string
          author_id:  string
          body:       string
          created_at?: string
        }
        Update: {
          body?: string
        }
        Relationships: []
      }
    }
    Views:          { [_ in never]: never }
    Functions: {
      create_organization: {
        Args: { org_name: string; org_slug: string }
        Returns: Json
      }
      create_ticket: {
        Args: {
          p_org_id:       string
          p_title:        string
          p_description?: string | null
          p_priority?:    TicketPriority
          p_assignee_id?: string | null
          p_due_date?:    string | null
          p_tags?:        string[]
        }
        Returns: Json
      }
      update_ticket: {
        Args: {
          p_ticket_id:   string
          p_title:       string
          p_description: string | null
          p_priority:    TicketPriority
          p_assignee_id: string | null
          p_due_date:    string | null
          p_tags:        string[]
        }
        Returns: Json
      }
      update_ticket_status: {
        Args: { p_ticket_id: string; p_status: TicketStatus }
        Returns: Json
      }
      delete_ticket: {
        Args: { p_ticket_id: string }
        Returns: void
      }
      create_comment: {
        Args: { p_ticket_id: string; p_body: string }
        Returns: Json
      }
      delete_comment: {
        Args: { p_comment_id: string }
        Returns: void
      }
      add_org_member: {
        Args: { p_org_id: string; p_email: string }
        Returns: Json
      }
      remove_org_member: {
        Args: { p_member_id: string }
        Returns: void
      }
      delete_organization: {
        Args: { p_org_id: string }
        Returns: void
      }
    }
    Enums: {
      app_role:        AppRole
      ticket_status:   TicketStatus
      ticket_priority: TicketPriority
    }
    CompositeTypes: { [_ in never]: never }
  }
}
