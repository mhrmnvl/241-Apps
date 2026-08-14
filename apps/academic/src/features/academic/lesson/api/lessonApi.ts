import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  LessonBatchRow,
  LessonQueryParams,
  Lesson,
  ScheduleResponse,
} from '../types'

export const lessonApi = {
  getLessons: (params?: LessonQueryParams) => {
    return api.get<ApiPaginatedResponse<ScheduleResponse>>('/schedules', {
      params,
    })
  },

  getLessonsByClassroom: (classroomId: string) => {
    return api.get<{ data: ScheduleResponse[] }>(
      `/schedules/classroom/${classroomId}`,
    )
  },

  /**
   * The caller's own schedule, resolved by the server from their records — the
   * timetable of the classroom they are enrolled in, the lessons they teach, or
   * both. There is no parameter, and that is the point: the browser does not
   * decide which of those the person is.
   */
  getMySchedule: () => {
    return api.get<{
      data: { classroom: ScheduleResponse[]; teaching: ScheduleResponse[] }
    }>('/schedules/me')
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
