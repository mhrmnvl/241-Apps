import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdmissionAnnouncement, AdmissionWaveSummary } from '../types'

export const useAnnouncementStore = defineStore('admissionAnnouncement', () => {
  const announcements = ref<AdmissionAnnouncement[]>([])
  const waves = ref<AdmissionWaveSummary[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return {
    announcements,
    waves,
    totalItems,
    loading,
    isSaving,
    formError,
  }
})
