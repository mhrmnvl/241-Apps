import type { ApiPaginatedResponse } from '@/shared/types/api'
import type { SocialMediaRecord } from '../types'
import { ref, watch } from 'vue'
import { profileService } from '../services/profileService'

export function useSocialMediaList(roles: string[] | string) {
  const data = ref<ApiPaginatedResponse<SocialMediaRecord>>({
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  })
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const page = ref(1)
  const limit = ref(10)
  const search = ref('')

  const fetchList = async () => {
    isLoading.value = true
    error.value = null
    const activeRole = Array.isArray(roles) ? roles[0] : roles
    try {
      const response = await profileService.fetchSocialMedias({
        page: page.value,
        limit: limit.value,
        search: search.value,
        role: activeRole || '',
      })
      data.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      isLoading.value = false
    }
  }

  watch(
    [page, limit, search],
    () => {
      void fetchList()
    },
    { immediate: true },
  )

  const isSaving = ref(false)

  const saveSocialMedia = async (
    userId: string,
    socialMediaId: string,
    payload: { platformId: string; username: string },
  ) => {
    isSaving.value = true
    try {
      await profileService.saveSocialMedia(userId, socialMediaId, payload)
      await fetchList()
    } finally {
      isSaving.value = false
    }
  }

  const isDeleting = ref(false)

  const deleteSocialMedia = async ({
    userId,
    id,
  }: {
    userId: string
    id: string
  }) => {
    isDeleting.value = true
    try {
      await profileService.deleteSocialMedia(userId, id)
      await fetchList()
    } finally {
      isDeleting.value = false
    }
  }

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    search,
    saveSocialMedia,
    isSaving,
    deleteSocialMedia,
    isDeleting,
    fetchList,
  }
}
