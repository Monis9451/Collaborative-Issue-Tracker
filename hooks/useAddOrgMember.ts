'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { addOrgMemberAction } from '@/lib/members/actions'


export function useAddOrgMember(orgId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => addOrgMemberAction(orgId, email),
    onSuccess: () => {
      // invalidate + force immediate refetch so the new row shows up right away
      queryClient.invalidateQueries({ queryKey: queryKeys.members.list(orgId) })
      queryClient.refetchQueries({ queryKey: queryKeys.members.list(orgId) })
    },
  })
}
