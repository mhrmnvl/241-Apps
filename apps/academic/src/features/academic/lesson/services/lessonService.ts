import { lessonApi } from '../api/lessonApi'
import { useLessonStore } from '../stores/lessonStore'
import { classroomApi } from '@/features/academic/classroom'
import { timeSlotApi } from '@/features/academic/time-slot'
import { subjectApi } from '@/features/academic/subject'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'
import type {
  LessonBatchRow,
  LessonQueryParams,
  LessonServiceResult,
  ScheduleResponse,
} from '../types'

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
}

export const lessonService = {
  getLessons: async (
    params?: LessonQueryParams,
  ): Promise<LessonServiceResult> => {
    const store = useLessonStore()
    store.loading = true
    try {
      const response = await lessonApi.getLessons(params)
      return {
        success: true,
        data: (response?.data?.data as unknown as ScheduleResponse[]) ?? [],
      }
    } catch (err: unknown) {
      return { success: false, error: err }
    } finally {
      store.loading = false
    }
  },

  getLessonsByClassroom: async (
    classroomId: string,
  ): Promise<LessonServiceResult> => {
    const store = useLessonStore()
    store.loading = true
    try {
      const response = await lessonApi.getLessonsByClassroom(classroomId)
      return {
        success: true,
        data: (response?.data?.data as unknown as ScheduleResponse[]) ?? [],
      }
    } catch (err: unknown) {
      return { success: false, error: err }
    } finally {
      store.loading = false
    }
  },

  updateLessonBatch: async (
    classroomId: string,
    day: string,
    lessons: LessonBatchRow[],
  ) => {
    const store = useLessonStore()
    store.isSaving = true
    try {
      await lessonApi.updateLessonBatch(classroomId, day, lessons)
      const dayLabel = DAY_LABELS[day] ?? day
      if (lessons.length === 0) {
        toast.success(`Jadwal ${dayLabel} berhasil dihapus`)
      } else {
        toast.success(`Jadwal ${dayLabel} berhasil disimpan`)
      }
      return { success: true }
    } catch (err: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        err,
        'Gagal menyimpan jadwal',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      store.isSaving = false
    }
  },

  createLesson: async (payload: Partial<LessonBatchRow>) => {
    const store = useLessonStore()
    store.isSaving = true
    try {
      await lessonApi.createLesson(payload)
      toast.success('Jadwal berhasil ditambahkan')
      return { success: true }
    } catch (err: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        err,
        'Gagal menambahkan jadwal',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      store.isSaving = false
    }
  },

  updateLesson: async (id: string, payload: Partial<LessonBatchRow>) => {
    const store = useLessonStore()
    store.isSaving = true
    try {
      await lessonApi.updateLesson(id, payload)
      toast.success('Jadwal berhasil diperbarui')
      return { success: true }
    } catch (err: unknown) {
      const errorMessage = getIndonesianErrorMessage(
        err,
        'Gagal memperbarui jadwal',
      )
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      store.isSaving = false
    }
  },

  getClassrooms: async (params?: { limit?: number; isActive?: boolean }) => {
    return await classroomApi.getClassrooms(params)
  },

  getClassroomById: async (id: string) => {
    return await classroomApi.getClassroomById(id)
  },

  getTimeSlots: async (params?: { limit?: number }) => {
    return await timeSlotApi.getTimeSlots(params)
  },

  getSubjects: async (params?: { limit?: number }) => {
    return await subjectApi.getSubjects(params)
  },

  showValidationError: (message: string) => {
    toast.error(message)
  },
}
