import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClassroomLevel } from '../types'

export const useClassroomLevelStore = defineStore('classroomLevel', () => {
  const items = ref<ClassroomLevel[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return { items, totalItems, loading, isSaving, formError }
})
