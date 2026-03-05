import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database'

/**
 * Browser-side Supabase client.
 *
 * Use this inside Client Components ('use client') and custom hooks.
 * It reads the session from secure cookies managed by @supabase/ssr.
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/client'
 *   const supabase = createClient()
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
