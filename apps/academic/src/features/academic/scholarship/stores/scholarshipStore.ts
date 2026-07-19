import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useScholarshipStore = defineStore('scholarship', () => {
  const isSaving = ref(false)

  return {
    isSaving,
  }
})
