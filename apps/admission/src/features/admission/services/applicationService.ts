import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import { useApplicationStore } from '../stores/applicationStore'
import { useReferenceList } from '@/features/platform/reference-data'

export interface ApplicationListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  waveId?: string
}

export const applicationService = {
  fetchApplications: async (params: ApplicationListParams) => {
    const store = useApplicationStore()
    store.loading = true
    try {
      const res = await admissionApi.getApplications(params)
      store.applications = res.data.data ?? []
      store.total = res.data.meta?.total ?? 0
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat daftar pendaftar.'),
      )
    } finally {
      store.loading = false
    }
  },

  fetchWaves: async () => {
    const store = useApplicationStore()
    try {
      store.waves = await useReferenceList().read(
        'admissionWaves',
        async () => {
          const res = await admissionApi.getWaves({ limit: 100 })
          return res.data.data ?? []
        },
      )
    } catch {
      store.waves = []
    }
  },
}
