import { ref } from 'vue'
import { lessonService } from '../services/lessonService'
import { PAGINATION } from '@/shared/constants/pagination'
import type { LessonClassItem } from '../types'

export function useLessonClassrooms() {
  const classrooms = ref<LessonClassItem[]>([])
  const loading = ref(false)

  async function fetchClassrooms() {
    loading.value = true
    try {
      const res = await lessonService.getClassrooms({
        limit: PAGINATION.REFERENCE_LIMIT,
        isActive: true,
      })
      classrooms.value = res.data.data
    } catch {
      classrooms.value = []
    } finally {
      loading.value = false
    }
  }

  return { classrooms, loading, fetchClassrooms }
}
