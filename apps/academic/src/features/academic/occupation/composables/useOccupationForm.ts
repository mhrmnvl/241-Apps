import { ref } from 'vue'
import { occupationService } from '../services/occupationService'
import type { OccupationCreatePayload, OccupationUpdatePayload } from '../types'

export function useOccupationForm() {
  const isSubmitting = ref(false)

  const createOccupation = async (payload: OccupationCreatePayload) => {
    isSubmitting.value = true
    try {
      return await occupationService.createOccupation(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateOccupation = async (
    id: string,
    payload: OccupationUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await occupationService.updateOccupation(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createOccupation,
    updateOccupation,
  }
}
