import { ref } from 'vue'
import { academicCalendarTypeService } from '../services/academicCalendarTypeService'
import type {
  AcademicCalendarTypeCreatePayload,
  AcademicCalendarTypeUpdatePayload,
} from '../types'

export function useAcademicCalendarTypeForm() {
  const isSubmitting = ref(false)

  const createAcademicCalendarType = async (
    payload: AcademicCalendarTypeCreatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await academicCalendarTypeService.createAcademicCalendarType(
        payload,
      )
    } finally {
      isSubmitting.value = false
    }
  }

  const updateAcademicCalendarType = async (
    id: string,
    payload: AcademicCalendarTypeUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await academicCalendarTypeService.updateAcademicCalendarType(
        id,
        payload,
      )
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createAcademicCalendarType,
    updateAcademicCalendarType,
  }
}
