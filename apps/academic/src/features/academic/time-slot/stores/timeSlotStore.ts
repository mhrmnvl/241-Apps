import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TimeSlot } from '../types'

export const useTimeSlotStore = defineStore('timeSlot', () => {
  const timeSlots = ref<TimeSlot[]>([])
  const totalTimeSlots = ref(0)
  const loading = ref(false)
  const isSaving = ref(false)
  const formError = ref<string | null>(null)

  return {
    timeSlots,
    totalTimeSlots,
    loading,
    isSaving,
    formError,
  }
})
