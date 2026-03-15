import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/users.api'
import { queryKeys } from '@/lib/queryKeys'
import type { RedeemRewardRequest } from '@/types/user.types'

export function useRewards() {
  return useQuery({
    queryKey: queryKeys.userRewards(),
    queryFn: usersApi.getRewards,
    staleTime: 30_000,
  })
}

export function useRedeemReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RedeemRewardRequest) => usersApi.redeemReward(data),
    onSuccess: () => {
      // Invalidate rewards query to refetch updated points
      queryClient.invalidateQueries({ queryKey: queryKeys.userRewards() })
      // Also invalidate user profile in case features were unlocked
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() })
    },
  })
}


