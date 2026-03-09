'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signInWithEmail } from '@/lib/auth/actions'
import { queryKeys } from '@/lib/query/keys'
import type { LoginFormValues } from '@/types/auth'

export function useSignIn() {
  const queryClient = useQueryClient()
  const router      = useRouter()

  return useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      signInWithEmail(email, password),

    onSuccess: () => {
      // Invalidate cached user so useCurrentUser refetches with fresh session
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all() })
      router.push('/dashboard')
      router.refresh()
    },
  })
}
