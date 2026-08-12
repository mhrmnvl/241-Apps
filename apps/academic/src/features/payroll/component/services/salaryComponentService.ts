import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { salaryComponentApi } from '../api/salaryComponentApi'
import type {
  CreateSalaryComponentPayload,
  SalaryComponent,
  SalaryComponentSavePayload,
  UpdateSalaryComponentPayload,
} from '../types'

export const components = ref<SalaryComponent[]>([])
export const loading = ref(false)
export const isSaving = ref(false)

export const salaryComponentService = {
  fetch: async () => {
    loading.value = true
    try {
      const res = await salaryComponentApi.getComponents()
      components.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat komponen gaji.'),
      )
      components.value = []
    } finally {
      loading.value = false
    }
  },

  save: async (id: string | null, payload: SalaryComponentSavePayload) => {
    isSaving.value = true
    try {
      if (id) {
        const updatePayload: UpdateSalaryComponentPayload = {
          code: payload.code,
          name: payload.name,
          type: payload.type,
          driver: payload.driver,
          isActive: payload.isActive,
        }
        await salaryComponentApi.updateComponent(id, updatePayload)
        toast.success('Komponen gaji diperbarui.')
      } else {
        const createPayload: CreateSalaryComponentPayload = {
          code: payload.code,
          name: payload.name,
          type: payload.type,
          driver: payload.driver,
        }
        await salaryComponentApi.createComponent(createPayload)
        toast.success('Komponen gaji ditambahkan.')
      }
      await salaryComponentService.fetch()
      return true
    } catch (error: unknown) {
      // The API refuses an incoherent driver pairing with its own message.
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan komponen gaji.'),
      )
      return false
    } finally {
      isSaving.value = false
    }
  },

  remove: async (id: string) => {
    try {
      await salaryComponentApi.deleteComponent(id)
      toast.success('Komponen gaji dihapus.')
      await salaryComponentService.fetch()
      return true
    } catch (error: unknown) {
      // A component still assigned to somebody is refused, naming how many —
      // deactivating it is the right move there.
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus komponen gaji.'),
      )
      return false
    }
  },
}
