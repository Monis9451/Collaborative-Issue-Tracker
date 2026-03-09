'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query/keys'
import type { Profile } from '@/types/database'


async function fetchCurrentUser(): Promise<Profile | null> {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) throw new Error(profileError.message)

  return profile
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn:  fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes — profile rarely changes
    retry: false,              // Don't retry auth failures
  })
}
