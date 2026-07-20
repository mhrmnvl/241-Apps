import { classroomApi } from '@/features/academic/classroom'
import { lessonService } from '@/features/academic/lesson'
import { useScheduleStore } from '../stores/scheduleStore'
import { timeSlotApi } from '@/features/academic/time-slot'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { toast } from 'vue-sonner'

export const scheduleService = {
  fetchClassroomsForAdmin: async (queryClassroomId?: string) => {
    const store = useScheduleStore()
    store.isLoadingClassrooms = true
    try {
      const res = await classroomApi.getClassrooms({
        limit: 100,
        isActive: true,
      })
      store.classrooms = res.data.data

      if (queryClassroomId) {
        store.selectedClassroomId = queryClassroomId
      }
      return { success: true }
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memuat daftar kelas'))
      return { success: false }
    } finally {
      store.isLoadingClassrooms = false
    }
  },

  fetchSchedule: async (params: {
    isTeacher: boolean
    teacherId?: string
    selectedClassroomId: string
  }) => {
    const { isTeacher, teacherId, selectedClassroomId } = params
    const store = useScheduleStore()

    if (!isTeacher && !selectedClassroomId) return
    if (isTeacher && !teacherId) return

    store.isLoadingSchedule = true
    store.lessons = []
    store.timeSlots = []

    try {
      const tsPromise = timeSlotApi.getTimeSlots({ limit: 100 })
      let lessonPromise

      if (isTeacher) {
        lessonPromise = lessonService.getLessons({
          teacherId: teacherId!,
          limit: 100,
        })
      } else {
        lessonPromise = lessonService.getLessonsByClassroom(selectedClassroomId)
      }

      const [tsRes, lessonRes] = await Promise.all([tsPromise, lessonPromise])

      store.timeSlots = (tsRes.data?.data ?? []).map((ts) => ({
        ...ts,
        type: ts.type?.code,
      }))
      store.lessons = Array.isArray(lessonRes.data) ? lessonRes.data : []

      return { success: true }
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memuat jadwal pelajaran'))
      return { success: false }
    } finally {
      store.isLoadingSchedule = false
    }
  },
}
