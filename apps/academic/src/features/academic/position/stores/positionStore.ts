import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Position } from '../types'

export const usePositionStore = defineStore('position', () => {
  const items = ref<Position[]>([])
  const totalItems = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return { items, totalItems, loading, isSaving, formError }
})
