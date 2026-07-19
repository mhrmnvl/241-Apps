import { ref } from 'vue'
import { employmentTypeService } from '../services/employmentTypeService'
import type {
  EmploymentTypeCreatePayload,
  EmploymentTypeUpdatePayload,
} from '../types'

export function useEmploymentTypeForm() {
  const isSubmitting = ref(false)

  const createEmploymentType = async (payload: EmploymentTypeCreatePayload) => {
    isSubmitting.value = true
    try {
      return await employmentTypeService.createEmploymentType(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateEmploymentType = async (
    id: string,
    payload: EmploymentTypeUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await employmentTypeService.updateEmploymentType(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createEmploymentType,
    updateEmploymentType,
  }
}
