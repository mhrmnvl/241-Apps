import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { settingsApi } from '../api/settingsApi'
import type {
  AppKey,
  AppSetting,
  UpdateAppSettingPayload,
} from '../types/app-setting.types'

export const useSettingsStore = defineStore('appSettings', () => {
  const settings = ref<AppSetting | null>(null)
  const isLoading = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  const hiddenMenuKeys = computed(() => settings.value?.hiddenMenuKeys ?? [])
  const maintenanceMode = computed(
    () => settings.value?.maintenanceMode ?? false,
  )

  async function fetchSettings(appKey: AppKey) {
    isLoading.value = true
    error.value = null
    try {
      const res = await settingsApi.getSettings(appKey)
      settings.value = res.data.data
    } catch (err) {
      error.value = getIndonesianErrorMessage(
        err,
        'Gagal memuat pengaturan aplikasi.',
      )
    } finally {
      isLoading.value = false
      isLoaded.value = true
    }
  }

  async function updateSettings(
    appKey: AppKey,
    payload: UpdateAppSettingPayload,
  ) {
    const res = await settingsApi.updateSettings(appKey, payload)
    settings.value = res.data.data
    return settings.value
  }

  async function uploadLogo(appKey: AppKey, file: File) {
    const res = await settingsApi.uploadLogo(appKey, file)
    settings.value = res.data.data
    return settings.value
  }

  async function uploadFavicon(appKey: AppKey, file: File) {
    const res = await settingsApi.uploadFavicon(appKey, file)
    settings.value = res.data.data
    return settings.value
  }

  return {
    settings,
    isLoading,
    isLoaded,
    error,
    hiddenMenuKeys,
    maintenanceMode,
    fetchSettings,
    updateSettings,
    uploadLogo,
    uploadFavicon,
  }
})
