import { ref, type Ref } from 'vue'
import { toast } from 'vue-sonner'

export interface ProfileSheetsReturn {
  showEditProfile: Ref<boolean>
  showEditAddress: Ref<boolean>
  handleActionClick: (tabId: string) => void
}

export function useProfileSheets(): ProfileSheetsReturn {
  const showEditProfile = ref(false)
  const showEditAddress = ref(false)

  const handleActionClick = (tabId: string) => {
    if (tabId === 'personal') {
      showEditProfile.value = true
    } else if (tabId === 'address') {
      showEditAddress.value = true
    } else {
      toast.info(`Fitur edit untuk tab ${tabId} akan segera hadir`)
    }
  }

  return {
    showEditProfile,
    showEditAddress,
    handleActionClick,
  }
}
