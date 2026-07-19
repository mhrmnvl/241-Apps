import { storeToRefs } from 'pinia'
import { useProfileStore } from '../stores/profileStore'
import { profileService } from '../services/profileService'

export function useProfile() {
  const store = useProfileStore()

  const { loading, profileData, rawProfile, isSaving } = storeToRefs(store)

  return {
    loading,
    profileData,
    rawProfile,
    isSaving,
    fetchProfileData: profileService.fetchProfileData,
    updateProfile: profileService.updateProfile,
  }
}
