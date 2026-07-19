import { accountApi } from '../api/accountApi'
import type { ChangePasswordPayload } from '../types'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

export const accountService = {
  changePassword: async (userId: string, payload: ChangePasswordPayload) => {
    try {
      await accountApi.changePassword(userId, payload)
      toast.success('Password berhasil diganti')
      return { success: true }
    } catch (error) {
      toast.error('Gagal mengganti password', {
        description: getIndonesianErrorMessage(
          error,
          'Terjadi kesalahan saat mengganti password.',
        ),
      })
      return { success: false }
    }
  },
}
