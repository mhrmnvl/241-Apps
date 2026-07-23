import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ProfileStoreData, RawProfileData } from '../types'

export const useProfileStore = defineStore('profile', () => {
  const loading = ref(false)
  const profileData = ref<ProfileStoreData>({})
  const rawProfile = ref<RawProfileData>({})
  const isSaving = ref(false)
  const isUploadingPhoto = ref(false)

  return {
    loading,
    profileData,
    rawProfile,
    isSaving,
    isUploadingPhoto,
  }
})
