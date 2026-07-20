import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import type { RegisterPayload } from '../types'

export const publicAdmissionService = {
  fetchActiveWaves: async () => {
    try {
      const res = await admissionApi.getActiveWaves()
      return res.data.data
    } catch {
      return null
    }
  },

  register: async (payload: RegisterPayload) => {
    try {
      const res = await admissionApi.register(payload)
      return { success: true as const, data: res.data.data }
    } catch (error: unknown) {
      return {
        success: false as const,
        error: getIndonesianErrorMessage(
          error,
          'Gagal membuat akun pendaftaran.',
        ),
      }
    }
  },

  fetchAnnouncements: async () => {
    try {
      const res = await admissionApi.getAnnouncements()
      return res.data.data
    } catch {
      return []
    }
  },
}
