import { ref } from 'vue'
import { schoolUnitTypeService } from '../services/schoolUnitTypeService'
import type {
  SchoolUnitTypeCreatePayload,
  SchoolUnitTypeUpdatePayload,
} from '../types'

export function useSchoolUnitTypeForm() {
  const isSubmitting = ref(false)

  const createSchoolUnitType = async (payload: SchoolUnitTypeCreatePayload) => {
    isSubmitting.value = true
    try {
      return await schoolUnitTypeService.createSchoolUnitType(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updateSchoolUnitType = async (
    id: string,
    payload: SchoolUnitTypeUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await schoolUnitTypeService.updateSchoolUnitType(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createSchoolUnitType,
    updateSchoolUnitType,
  }
}
