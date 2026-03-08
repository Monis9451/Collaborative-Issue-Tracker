'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signUpWithEmail } from '@/lib/auth/actions'
import type { RegisterFormValues } from '@/types/auth'

// ─────────────────────────────────────────────────────────────
//  Registration mutation hook.
//  On success: navigates to /dashboard/onboarding (or /dashboard).
//  Supabase may require email confirmation — the server action
//  doesn't throw in that case; the UI instructs the user to check email.
// ─────────────────────────────────────────────────────────────

type RegisterPayload = Pick<RegisterFormValues, 'email' | 'password' | 'full_name'>

export function useSignUp() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ email, password, full_name }: RegisterPayload) =>
      signUpWithEmail(email, password, full_name),

    onSuccess: () => {
      // After sign-up Supabase may send a confirmation email.
      // If email confirmation is disabled in the project settings,
      // the user is signed in automatically and middleware will
      // redirect them from /register → /dashboard.
      router.push('/register/confirm')
      router.refresh()
    },
  })
}
