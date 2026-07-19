import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAddressStore = defineStore('address', () => {
  const isSaving = ref(false)

  return {
    isSaving,
  }
})
