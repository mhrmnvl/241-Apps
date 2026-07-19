import { ref } from 'vue'
import { positionCategoryService } from '../services/positionCategoryService'
import type {
  PositionCategoryCreatePayload,
  PositionCategoryUpdatePayload,
} from '../types'

export function usePositionCategoryForm() {
  const isSubmitting = ref(false)

  const createPositionCategory = async (
    payload: PositionCategoryCreatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await positionCategoryService.createPositionCategory(payload)
    } finally {
      isSubmitting.value = false
    }
  }

  const updatePositionCategory = async (
    id: string,
    payload: PositionCategoryUpdatePayload,
  ) => {
    isSubmitting.value = true
    try {
      return await positionCategoryService.updatePositionCategory(id, payload)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    createPositionCategory,
    updatePositionCategory,
  }
}
