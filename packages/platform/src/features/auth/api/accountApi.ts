import api from '@/shared/utils/api'
import type { ApiEnvelope } from '@/shared/types/api'
import type { AuthUser, ChangePasswordPayload } from '../types'

export const accountApi = {
  changePassword: (userId: string, payload: ChangePasswordPayload) => {
    return api.patch<ApiEnvelope<AuthUser>>(`/users/${userId}`, payload)
  },
}
