import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { LessonBatchRow, LessonQueryParams, Lesson } from '../types'

export const lessonApi = {
  getLessons: (params?: LessonQueryParams) => {
    return api.get<ApiPaginatedResponse<Lesson>>('/schedules', { params })
  },

  getLessonsByClassroom: (classroomId: string) => {
    return api.get<{ data: Lesson[] }>(`/schedules/classroom/${classroomId}`)
  },

  updateLessonBatch: (
    classroomId: string,
    day: string,
    lessons: LessonBatchRow[],
  ) => {
    return api.put<ApiSingleResponse<Lesson>>(
      `/schedules/classroom/${classroomId}/batch`,
      {
        day,
        lessons,
      },
    )
  },

  createLesson: (payload: Partial<LessonBatchRow>) => {
    return api.post<ApiSingleResponse<Lesson>>('/schedules', payload)
  },

  updateLesson: (id: string, payload: Partial<LessonBatchRow>) => {
    return api.patch<ApiSingleResponse<Lesson>>(`/schedules/${id}`, payload)
  },
}
