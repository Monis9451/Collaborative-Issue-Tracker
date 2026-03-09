'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/actions'

export function useSignOut() {
  const queryClient = useQueryClient()
  const router      = useRouter()

  return useMutation({
    mutationFn: () => signOut(),

    onSuccess: () => {
      // Wipe entire cache — critical for multi-user machines
      queryClient.clear()
      router.push('/login')
      router.refresh()
    },
  })
}
