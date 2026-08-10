import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { leaveTypeApi } from '../api/leaveTypeApi'
import type { LeaveType, LeaveTypeSavePayload } from '../types'

export const leaveTypes = ref<LeaveType[]>([])
export const loading = ref(false)
export const isSaving = ref(false)

export const leaveTypeService = {
  fetch: async () => {
    loading.value = true
    try {
      const res = await leaveTypeApi.getLeaveTypes()
      leaveTypes.value = res.data?.data ?? []
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat jenis izin.'))
      leaveTypes.value = []
    } finally {
      loading.value = false
    }
  },

  save: async (id: string | null, payload: LeaveTypeSavePayload) => {
    isSaving.value = true
    try {
      if (id) {
        await leaveTypeApi.updateLeaveType(id, payload)
        toast.success('Jenis izin diperbarui.')
      } else {
        await leaveTypeApi.createLeaveType(payload)
        toast.success('Jenis izin ditambahkan.')
      }
      await leaveTypeService.fetch()
      return true
    } catch (error: unknown) {
      // The API refuses an incoherent quota pairing with its own message.
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan jenis izin.'),
      )
      return false
    } finally {
      isSaving.value = false
    }
  },

  remove: async (id: string) => {
    try {
      await leaveTypeApi.deleteLeaveType(id)
      toast.success('Jenis izin dihapus.')
      await leaveTypeService.fetch()
      return true
    } catch (error: unknown) {
      // A type already used by requests is refused, naming how many — the
      // right move there is to deactivate it instead.
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus jenis izin.'),
      )
      return false
    }
  },
}
