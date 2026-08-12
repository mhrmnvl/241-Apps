import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import { useWaveStore } from '../stores/waveStore'
import type { WaveSavePayload } from '../types'
import { useReferenceList } from '@/features/platform/reference-data'

export const waveService = {
  fetchWaves: async () => {
    const store = useWaveStore()
    store.loading = true
    try {
      const res = await admissionApi.getWaves({ limit: 100 })
      store.waves = res.data.data ?? []
      store.totalItems = res.data.meta?.total ?? store.waves.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat gelombang.'))
    } finally {
      store.loading = false
    }
  },

  fetchAcademicYears: async () => {
    const store = useWaveStore()
    try {
      const res = await admissionApi.getAcademicYears()
      store.academicYears = res.data.data ?? []
    } catch {
      store.academicYears = []
    }
  },

  saveWave: async (id: string | null, payload: WaveSavePayload) => {
    const store = useWaveStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await admissionApi.updateWave(id, payload)
        toast.success('Gelombang berhasil diperbarui.')
      } else {
        await admissionApi.createWave(payload)
        toast.success('Gelombang baru berhasil dibuat.')
      }
      // The dropdowns elsewhere are now out of date.
      useReferenceList().invalidate('admissionWaves')
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan gelombang.',
      )
      toast.error(store.formError)
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteWave: async (id: string) => {
    try {
      await admissionApi.deleteWave(id)
      toast.success('Gelombang dihapus.')
      // The dropdowns elsewhere are now out of date.
      useReferenceList().invalidate('admissionWaves')
      return { success: true }
    } catch (error: unknown) {
      const msg = getIndonesianErrorMessage(error, 'Gagal menghapus gelombang.')
      toast.error(msg)
      return { success: false, error: msg }
    }
  },
}
