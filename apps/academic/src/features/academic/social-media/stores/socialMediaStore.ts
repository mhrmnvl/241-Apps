import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SocialMedia } from '../types'
import type { PaginationMeta } from '@/shared/types/api'

export const useSocialMediaStore = defineStore('socialMedia', () => {
  const socialMedias = ref<SocialMedia[]>([])
  const isLoading = ref(false)
  const paginationMeta = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const currentFilters = ref<{
    page?: number
    limit?: number
    search?: string
  }>({
    page: 1,
    limit: 10,
  })
  const selectedSocialMedia = ref<SocialMedia | null>(null)
  const isFormOpen = ref(false)
  const isSubmitting = ref(false)

  function resetForm() {
    selectedSocialMedia.value = null
    isFormOpen.value = false
  }

  function openForm(item: SocialMedia | null = null) {
    selectedSocialMedia.value = item
    isFormOpen.value = true
  }

  return {
    socialMedias,
    isLoading,
    paginationMeta,
    currentFilters,
    selectedSocialMedia,
    isFormOpen,
    isSubmitting,
    resetForm,
    openForm,
  }
})
