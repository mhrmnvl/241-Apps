import { timeSlotApi } from '../api/timeSlotApi'
import { useTimeSlotStore } from '../stores/timeSlotStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type { TimeSlotSavePayload } from '../types'

export const timeSlotService = {
  fetchTimeSlots: async () => {
    const store = useTimeSlotStore()
    store.loading = true
    try {
      const res = await timeSlotApi.getTimeSlots({ limit: 100 })
      store.timeSlots = res.data.data ?? []
      store.totalTimeSlots = res.data.meta?.total ?? store.timeSlots.length
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data jam pelajaran.'),
      )
    } finally {
      store.loading = false
    }
  },

  saveTimeSlot: async (id: string | null, payload: TimeSlotSavePayload) => {
    const store = useTimeSlotStore()
    store.isSaving = true
    store.formError = null
    try {
      if (id) {
        await timeSlotApi.updateTimeSlot(id, payload)
        toast.success('Berhasil memperbarui jam pelajaran')
      } else {
        await timeSlotApi.createTimeSlot(payload)
        toast.success('Berhasil menambah jam pelajaran')
      }
      await timeSlotService.fetchTimeSlots()
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan jam pelajaran.',
      )
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },

  deleteTimeSlot: async (id: string) => {
    try {
      await timeSlotApi.deleteTimeSlot(id)
      toast.success('Jam pelajaran berhasil dihapus')
      await timeSlotService.fetchTimeSlots()
      return { success: true }
    } catch (error: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        error,
        'Gagal menghapus jam pelajaran.',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  },
}
