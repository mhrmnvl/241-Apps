import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import { socialMediaApi } from '../api/socialMediaApi'
import { useSocialMediaStore } from '../stores/socialMediaStore'
import type {
  SocialMediaCreatePayload,
  SocialMediaUpdatePayload,
  SocialMediaQuery,
} from '../types'

export const socialMediaService = {
  fetchTableData: async (params?: SocialMediaQuery) => {
    const store = useSocialMediaStore()
    store.isLoading = true

    try {
      const mergedParams = { ...store.currentFilters, ...params }
      const res = await socialMediaApi.getSocialMedias(mergedParams)

      store.socialMedias = res.data?.data || []
      store.paginationMeta = res.data?.meta || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal memuat data socialMedia.'),
      )
    } finally {
      store.isLoading = false
    }
  },

  handleUpdateFilters: (filters: SocialMediaQuery) => {
    const store = useSocialMediaStore()
    store.currentFilters = filters
    void socialMediaService.fetchTableData()
  },

  handleSubmit: async (
    payload: SocialMediaCreatePayload | SocialMediaUpdatePayload,
  ) => {
    const store = useSocialMediaStore()
    store.isSubmitting = true
    try {
      if (store.selectedSocialMedia) {
        await socialMediaApi.updateSocialMedia(
          store.selectedSocialMedia.id,
          payload,
        )
        toast.success('Berhasil memperbarui data socialMedia')
      } else {
        await socialMediaApi.createSocialMedia(
          payload as SocialMediaCreatePayload,
        )
        toast.success('Berhasil menambahkan socialMedia baru')
      }
      void socialMediaService.fetchTableData()
      store.resetForm()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menyimpan data socialMedia'),
      )
      return false
    } finally {
      store.isSubmitting = false
    }
  },

  handleDelete: async (id: string) => {
    try {
      await socialMediaApi.deleteSocialMedia(id)
      toast.success('Berhasil menghapus socialMedia')
      void socialMediaService.fetchTableData()
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(error, 'Gagal menghapus socialMedia'),
      )
      return false
    }
  },

  deleteBulk: async (ids: string[]) => {
    if (!ids.length) return false
    try {
      const { deleted, failed } =
        await socialMediaApi.deleteBulkSocialMedias(ids)
      void socialMediaService.fetchTableData()

      // Say what happened rather than what was asked for. Reporting all of
      // them deleted when some were refused is how a row nobody meant to keep
      // survives unnoticed.
      if (failed === 0) {
        toast.success(`${deleted} media sosial berhasil dihapus.`)
        return true
      }
      if (deleted === 0) {
        toast.error('Gagal menghapus media sosial yang dipilih.')
        return false
      }
      toast.warning(
        `${deleted} media sosial dihapus, ${failed} gagal dan masih ada.`,
      )
      return true
    } catch (error: unknown) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal menghapus beberapa media sosial.',
        ),
      )
      return false
    }
  },
}
