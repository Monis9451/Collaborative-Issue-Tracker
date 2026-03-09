'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signUpWithEmail } from '@/lib/auth/actions'
import type { RegisterFormValues } from '@/types/auth'


type RegisterPayload = Pick<RegisterFormValues, 'email' | 'password' | 'full_name'>

export function useSignUp() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ email, password, full_name }: RegisterPayload) =>
      signUpWithEmail(email, password, full_name),

    onSuccess: () => {
      router.push('/register/confirm')
      router.refresh()
    },
  })
}
