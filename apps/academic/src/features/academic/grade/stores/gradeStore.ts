import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Grade } from '../types'

export const useGradeStore = defineStore('grade', () => {
  const items = ref<Grade[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return { items, totalItems, loading, isSaving, formError }
})
