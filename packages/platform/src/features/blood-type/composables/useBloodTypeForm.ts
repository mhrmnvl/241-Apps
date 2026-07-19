import { ref } from 'vue'
import { bloodTypeService } from '../services/bloodTypeService'
import type { BloodTypeCreatePayload, BloodTypeUpdatePayload } from '../types'

export function useBloodTypeForm() {
  const isSubmitting = ref(false)

  const createBloodType = async (payload: BloodTypeCreatePayload) => {
    isSubmitting.value = true
    try {
      return await bloodTypeService.createBloodType(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateBloodType = async (
    id: string,
    payload: BloodTypeUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await bloodTypeService.updateBloodType(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createBloodType,
    updateBloodType,
  }
}
