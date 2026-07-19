import { ref } from 'vue'
import { educationService } from '../services/educationService'
import type {
  EducationLevelCreatePayload,
  EducationLevelUpdatePayload,
} from '../types'

export function useEducationForm() {
  const isSubmitting = ref(false)

  const createEducationLevel = async (payload: EducationLevelCreatePayload) => {
    isSubmitting.value = true
    try {
      return await educationService.createEducationLevel(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateEducationLevel = async (
    id: string,
    payload: EducationLevelUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await educationService.updateEducationLevel(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createEducationLevel,
    updateEducationLevel,
  }
}
