import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/lib/api/users.api'
import { queryKeys } from '@/lib/queryKeys'

export function useRewards() {
  return useQuery({
    queryKey: queryKeys.userRewards(),
    queryFn: usersApi.getRewards,
    staleTime: 30_000,
  })
}
