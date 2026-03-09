'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { createOrganizationAction } from '@/lib/orgs/actions'
import type { CreateOrgInput } from '@/lib/orgs/actions'

export type { CreateOrgInput }


export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateOrgInput) => createOrganizationAction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.lists() })
    },
  })
}
