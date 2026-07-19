import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Lesson } from '../types'

export const useLessonStore = defineStore('lesson', () => {
  const defaultLessons = ref<Lesson[]>([])
  const loading = ref(false)
  const isSaving = ref(false)
  const isPublishing = ref(false)

  return {
    defaultLessons,
    loading,
    isSaving,
    isPublishing,
  }
})
