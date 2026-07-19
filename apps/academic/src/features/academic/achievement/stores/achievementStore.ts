import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAchievementStore = defineStore('achievement', () => {
  const isSaving = ref(false)

  return {
    isSaving,
  }
})
