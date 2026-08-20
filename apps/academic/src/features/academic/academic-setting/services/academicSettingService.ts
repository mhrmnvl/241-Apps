import { academicSettingApi } from '../api/academicSettingApi'
import { useAcademicSettingStore } from '../stores/academicSettingStore'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const academicSettingService = {
  fetchAcademicSetting: async () => {
    const store = useAcademicSettingStore()
    store.loading = true
    store.loadError = null
    try {
      const res = await academicSettingApi.getAcademicSetting()
      // `??` rather than `||`: an empty array is a real answer — school runs
      // every day — and must not fall back to anything.
      store.weeklyHolidays = res.data.data?.weeklyHolidays ?? []
    } catch (error: unknown) {
      store.loadError = getIndonesianErrorMessage(
        error,
        'Gagal memuat pengaturan akademik.',
      )
    } finally {
      store.loading = false
    }
  },

  saveWeeklyHolidays: async (weeklyHolidays: number[]) => {
    const store = useAcademicSettingStore()
    store.isSaving = true
    store.formError = null
    try {
      const res = await academicSettingApi.updateAcademicSetting({
        weeklyHolidays,
      })
      store.weeklyHolidays = res.data.data?.weeklyHolidays ?? weeklyHolidays
      toast.success('Hari libur mingguan berhasil disimpan.')
      return { success: true }
    } catch (error: unknown) {
      store.formError = getIndonesianErrorMessage(
        error,
        'Gagal menyimpan pengaturan akademik.',
      )
      toast.error(store.formError)
      return { success: false, error: store.formError }
    } finally {
      store.isSaving = false
    }
  },
}
