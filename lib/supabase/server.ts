import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database'

/**
 * Server-side Supabase client.
 *
 * Use this inside:
 *   - Server Components (RSC)
 *   - API Route Handlers (route.ts)
 *   - Server Actions
 *   - middleware.ts (see middleware helper below)
 *
 * It reads & writes the session cookie via next/headers, keeping
 * the session alive without any client-side JS.
 *
 * Usage:
 *   import { createClient } from '@/lib/supabase/server'
 *   const supabase = await createClient()
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from Server Components where cookies
            // cannot be mutated.  The middleware will handle refresh.
          }
        },
      },
    }
  )
}
