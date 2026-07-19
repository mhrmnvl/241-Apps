import { ref } from 'vue'
import { religionService } from '../services/religionService'
import type { ReligionCreatePayload, ReligionUpdatePayload } from '../types'

export function useReligionForm() {
  const isSubmitting = ref(false)

  const createReligion = async (payload: ReligionCreatePayload) => {
    isSubmitting.value = true
    try {
      return await religionService.createReligion(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateReligion = async (id: string, payload: ReligionUpdatePayload) => {
    isSubmitting.value = true
    try {
      return await religionService.updateReligion(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createReligion,
    updateReligion,
  }
}
