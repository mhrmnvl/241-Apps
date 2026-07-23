import { storeToRefs } from 'pinia'
import { useProfileStore } from '../stores/profileStore'
import { profileService } from '../services/profileService'

export function useProfile() {
  const store = useProfileStore()

  const { loading, profileData, rawProfile, isSaving, isUploadingPhoto } =
    storeToRefs(store)

  return {
    loading,
    profileData,
    rawProfile,
    isSaving,
    isUploadingPhoto,
    fetchProfileData: profileService.fetchProfileData,
    updateProfile: profileService.updateProfile,
    uploadPhoto: profileService.uploadPhoto,
  }
}
