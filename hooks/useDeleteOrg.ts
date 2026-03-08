'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { deleteOrgAction } from '@/lib/org/actions'

// ─────────────────────────────────────────────────────────────
//  useDeleteOrg
// ─────────────────────────────────────────────────────────────

export function useDeleteOrg() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orgId: string) => deleteOrgAction(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orgs.lists() })
      queryClient.refetchQueries({ queryKey: queryKeys.orgs.lists() })
    },
  })
}
