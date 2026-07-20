import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdmissionApplication } from '../types'

export const useApplicationDetailStore = defineStore(
  'admissionApplicationDetail',
  () => {
    const application = ref<AdmissionApplication | null>(null)
    const loading = ref(false)
    const acting = ref(false)

    return {
      application,
      loading,
      acting,
    }
  },
)
