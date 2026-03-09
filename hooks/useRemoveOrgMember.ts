'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { removeOrgMemberAction } from '@/lib/members/actions'

export function useRemoveOrgMember(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => removeOrgMemberAction(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.list(orgId) })
      queryClient.refetchQueries({ queryKey: queryKeys.members.list(orgId) })
    },
  })
}
