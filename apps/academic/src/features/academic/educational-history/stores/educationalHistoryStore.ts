import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEducationalHistoryStore = defineStore(
  'educationalHistory',
  () => {
    const isSaving = ref(false)

    return {
      isSaving,
    }
  },
)
