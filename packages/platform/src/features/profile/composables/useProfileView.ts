import { computed, ref, type Ref, type ComputedRef, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthSession, useRoleGuard } from '@/features/platform/auth'
import { useProfile } from './useProfile'
import { useProfileSheets } from './useProfileSheets'
import { PencilLine } from 'lucide-vue-next'
import type {
  ProfileUpdatePayload,
  RawProfileData,
  ProfileStoreData,
} from '../types'
import { profileConfig } from '../config'
import { toast } from 'vue-sonner'

export interface ProfileViewReturn {
  activeTab: Ref<string>
  showEditProfile: Ref<boolean>
  showEditAddress: Ref<boolean>
  loading: Ref<boolean>
  profileData: Ref<ProfileStoreData | null>
  rawProfile: Ref<RawProfileData | null>
  isSaving: Ref<boolean>
  isUploadingPhoto: Ref<boolean>
  isAdmin: ComputedRef<boolean>
  isEditable: ComputedRef<boolean>
  isOwnProfile: ComputedRef<boolean>
  initials: ComputedRef<string>
  profileSubtitle: ComputedRef<string>
  avatarUrl: ComputedRef<string | null>
  getUserId: ComputedRef<string>
  actionConfig: ComputedRef<{ text: string; icon: Component }>
  reloadProfile: () => void
  handleActionClick: (tabId: string) => void
  handleUpdateProfile: (payload: ProfileUpdatePayload) => Promise<void>
  handlePhotoChange: (file: File) => Promise<void>
}

export function useProfileView(): ProfileViewReturn {
  const route = useRoute()
  const activeTab = ref('personal')
  const { user: authUser } = useAuthSession()

  const { can } = useRoleGuard()
  const routeRole = computed(() => route.params.role as string | undefined)
  const routeId = computed(() => route.params.id as string | undefined)
  const isViewingOther = computed(() => !!routeRole.value && !!routeId.value)
  const isAdmin = computed(() => can('profiles.update'))

  const sheets = useProfileSheets()

  const {
    loading,
    profileData,
    rawProfile,
    isSaving,
    isUploadingPhoto,
    fetchProfileData,
    updateProfile,
    uploadPhoto,
  } = useProfile()

  const isOwnProfile = computed(() => !isViewingOther.value)

  const reloadProfile = () => {
    if (!authUser.value) return
    void fetchProfileData(
      authUser.value,
      isViewingOther.value,
      routeRole.value,
      routeId.value,
    )
  }

  const handleUpdateProfile = async (payload: ProfileUpdatePayload) => {
    const targetUserId = isViewingOther.value ? getUserId.value : undefined
    const { success } = await updateProfile(payload, targetUserId)
    if (success) {
      sheets.showEditProfile.value = false
      reloadProfile()
    }
  }

  const isEditable = computed(() => {
    if (activeTab.value === 'personal') return isAdmin.value
    if (activeTab.value === 'address') return isAdmin.value
    const extraTab = profileConfig.value.extraTabs.find(
      (t) => t.value === activeTab.value,
    )
    if (extraTab) {
      if (extraTab.value === 'positions') {
        return isAdmin.value
      }
      return extraTab.isEditable ?? false
    }
    return false
  })

  const actionConfig = computed(() => {
    const extraTab = profileConfig.value.extraTabs.find(
      (t) => t.value === activeTab.value,
    )
    if (extraTab?.actionConfig) {
      return extraTab.actionConfig
    }
    switch (activeTab.value) {
      case 'personal':
        return { text: 'Ubah Data Diri', icon: PencilLine }
      case 'address':
        return { text: 'Ubah Alamat', icon: PencilLine }
      default:
        return { text: 'Ubah Data', icon: PencilLine }
    }
  })

  const handleActionClick = (tabId: string) => {
    const extraTab = profileConfig.value.extraTabs.find(
      (t) => t.value === tabId,
    )
    if (extraTab?.onActionClick) {
      extraTab.onActionClick({
        rawProfile: rawProfile.value,
        profileData: profileData.value,
        getUserId: getUserId.value,
        reloadProfile,
      })
      return
    }
    if (tabId === 'personal') {
      sheets.showEditProfile.value = true
    } else if (tabId === 'address') {
      sheets.showEditAddress.value = true
    } else {
      toast.info(`Fitur edit untuk tab ${tabId} akan segera hadir`)
    }
  }

  const initials = computed(() => {
    const name = profileData.value?.fullName ?? ''
    return (
      name
        .split(' ')
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase() || '?'
    )
  })

  const profileSubtitle = computed(() => {
    if (!profileData.value?.roles?.length) return ''
    if (profileData.value.roles.includes('STUDENT')) {
      return `Siswa Kelas ${profileData.value.schoolIdentity?.className ?? '-'}`
    }
    return profileData.value.schoolIdentity?.primaryPosition ?? '-'
  })

  const getUserId = computed(() => {
    return (
      rawProfile.value?.userId ??
      rawProfile.value?.id ??
      authUser.value?.id ??
      ''
    )
  })

  const avatarUrl = computed(() => profileData.value?.avatar ?? null)

  const handlePhotoChange = async (file: File) => {
    const { success } = await uploadPhoto(file)
    if (success) reloadProfile()
  }

  return {
    activeTab,
    ...sheets,
    loading,
    profileData,
    rawProfile,
    isSaving,
    isUploadingPhoto,
    isAdmin,
    isEditable,
    isOwnProfile,
    initials,
    profileSubtitle,
    avatarUrl,
    getUserId,
    actionConfig,
    reloadProfile,
    handleActionClick,
    handleUpdateProfile,
    handlePhotoChange,
  }
}
