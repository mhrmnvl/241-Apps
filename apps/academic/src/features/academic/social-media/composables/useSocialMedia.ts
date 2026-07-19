import { storeToRefs } from 'pinia'
import { socialMediaService } from '../services/socialMediaService'
import { useSocialMediaStore } from '../stores/socialMediaStore'

export function useSocialMedia() {
  const store = useSocialMediaStore()
  const {
    socialMedias,
    isLoading,
    paginationMeta,
    currentFilters,
    selectedSocialMedia,
    isFormOpen,
    isSubmitting,
  } = storeToRefs(store)

  return {
    socialMedias,
    isLoading,
    paginationMeta,
    currentFilters,
    selectedSocialMedia,
    isFormOpen,
    isSubmitting,
    openForm: store.openForm,
    resetForm: store.resetForm,
    fetchTableData: socialMediaService.fetchTableData,
    handleUpdateFilters: socialMediaService.handleUpdateFilters,
    handleSubmit: socialMediaService.handleSubmit,
    handleDelete: socialMediaService.handleDelete,
    deleteBulk: socialMediaService.deleteBulk,
    fetchSocialMedias: socialMediaService.fetchTableData,
  }
}
