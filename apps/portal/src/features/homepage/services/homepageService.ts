import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { homepageApi } from '../api/homepageApi'
import { useHomepageStore } from '../stores/homepageStore'
import type { UpdateHomepageSectionPayload } from '../types'

export const homepageService = {
  /**
   * No toast on failure: this runs for anonymous visitors, and an error popup
   * on the school's homepage helps nobody. The store's `unavailable` flag
   * drives a neutral in-page notice instead (FR-032).
   */
  async fetchPublic() {
    const store = useHomepageStore()
    store.loading = true
    store.unavailable = false
    try {
      const { data } = await homepageApi.getPublic()
      store.sections = data.data?.sections ?? []
    } catch {
      store.sections = []
      store.unavailable = true
    } finally {
      store.loading = false
    }
  },

  async fetchSettings() {
    const store = useHomepageStore()
    store.loading = true
    try {
      const { data } = await homepageApi.getSections()
      store.settings = data.data ?? []
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat pengaturan beranda.'),
      )
    } finally {
      store.loading = false
    }
  },

  async updateSection(key: string, payload: UpdateHomepageSectionPayload) {
    const store = useHomepageStore()
    store.isSaving = true
    try {
      const { data } = await homepageApi.updateSection(key, payload)
      store.settings = store.settings.map((section) =>
        section.key === key ? data.data : section,
      )
      toast.success('Pengaturan beranda tersimpan.')
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan.'))
    } finally {
      store.isSaving = false
    }
  },
}
