import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usersApi } from '@/lib/api/users.api'
import { queryKeys } from '@/lib/queryKeys'
import type { UpdateUserPayload, UpdateProfilePayload } from '@/types/user.types'

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: usersApi.getProfile,
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserPayload) => usersApi.updateMe(data),
    onSuccess: (user) => {
      qc.setQueryData(queryKeys.currentUser(), user)
      toast.success('Account updated')
    },
    onError: () => toast.error('Failed to update account'),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => usersApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.userProfile() })
      toast.success('Health profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })
}
