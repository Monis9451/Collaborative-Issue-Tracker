'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCommentAction } from '@/lib/comments/actions'
import { queryKeys } from '@/lib/query/keys'

export function useDeleteComment(ticketId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => deleteCommentAction(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(ticketId),
      })
    },
  })
}
