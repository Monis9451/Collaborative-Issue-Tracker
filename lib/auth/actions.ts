'use server'

import { createClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────
//  Auth Server Actions — 'use server' makes these callable from
//  both Server Components and client-side useMutation hooks.
//  Functions throw Error on failure so TanStack Query's
//  mutation.error / mutation.isError work naturally.
// ─────────────────────────────────────────────────────────────

/**
 * Sign in with email and password.
 * Supabase sets a secure httpOnly session cookie via @supabase/ssr.
 * Throws a user-friendly Error on failure.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error('Invalid email or password. Please try again.')
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Please verify your email address before signing in.')
    }
    throw new Error(error.message)
  }
}

/**
 * Register a new user.
 * Creates the auth.users record. The `profiles` row is automatically
 * inserted by the Supabase DB trigger `handle_new_user` defined in schema.sql.
 * Throws a user-friendly Error on failure.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      throw new Error('An account with this email already exists.')
    }
    if (error.message.toLowerCase().includes('password')) {
      throw new Error('Password does not meet requirements. Use at least 8 characters.')
    }
    throw new Error(error.message)
  }
}

/**
 * Sign out the current user and clear the session cookie.
 * Throws on failure.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Get the currently authenticated user (server-side).
 * Safe to call in Server Components, API routes, and middleware.
 * Returns null if no active session — never throws.
 */
export async function getAuthUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null

  return user
}
