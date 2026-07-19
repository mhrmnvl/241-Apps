import { useScholarshipStore } from '../stores/scholarshipStore'
import { scholarshipApi } from '../api/scholarshipApi'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type {
  ScholarshipCreatePayload,
  ScholarshipUpdatePayload,
} from '../types'

export const scholarshipService = {
  saveScholarship: async (
    payload: ScholarshipCreatePayload | ScholarshipUpdatePayload,
    isCreate: boolean,
    itemId?: string,
  ) => {
    const store = useScholarshipStore()
    store.isSaving = true
    try {
      if (isCreate) {
        await scholarshipApi.createScholarship(
          payload as ScholarshipCreatePayload,
        )
        toast.success('Beasiswa berhasil ditambahkan')
      } else {
        await scholarshipApi.updateScholarship(itemId!, payload)
        toast.success('Beasiswa berhasil diperbarui')
      }
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal menyimpan beasiswa', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  deleteScholarship: async (id: string) => {
    try {
      await scholarshipApi.deleteScholarship(id)
      toast.success('Beasiswa berhasil dihapus')
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal menghapus beasiswa', {
        description: getIndonesianErrorMessage(err, 'Terjadi kesalahan.'),
      })
      return { success: false }
    }
  },
}
