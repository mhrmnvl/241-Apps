import { classroomApi } from '@/features/academic/classroom'
import { toScheduleLesson } from '../logic/toScheduleLesson'
import { lessonService } from '@/features/academic/lesson'
import { useScheduleStore } from '../stores/scheduleStore'
import { timeSlotApi } from '@/features/academic/time-slot'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { toast } from 'vue-sonner'

export const scheduleService = {
  fetchClassroomsForAdmin: async (queryClassroomId?: string) => {
    const store = useScheduleStore()
    store.isLoadingClassrooms = true
    try {
      const res = await classroomApi.getClassrooms({
        limit: PAGINATION.REFERENCE_LIMIT,
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

  /**
   * The signed-in person's own schedule, in one request.
   *
   * This replaces two paths that could never run. The teacher path required
   * `user.teacher.id` and the student path required `user.student.classroomId`,
   * and nothing has ever populated either field on the session — so
   * `fetchSchedule` returned at its own guard for a teacher, and `init` fell
   * through to a classroom picker that returns immediately for a student.
   * Neither of them has ever seen a timetable here.
   *
   * The server answers from the caller's records, so the browser no longer
   * needs to know which of the two they are — or to guess it from a role name
   * the school is free to invent.
   */
  fetchMySchedule: async () => {
    const store = useScheduleStore()
    store.isLoadingSchedule = true
    store.lessons = []
    store.timeSlots = []

    try {
      const [tsRes, mine] = await Promise.all([
        timeSlotApi.getTimeSlots({ limit: PAGINATION.REFERENCE_LIMIT }),
        lessonService.getMySchedule(),
      ])

      store.timeSlots = (tsRes.data?.data ?? []).map((ts) => ({
        ...ts,
        type: ts.type?.code,
        isLesson: ts.type?.isLesson,
        typeName: ts.type?.name,
        // Which days the period exists on. Dropped here before, so the table
        // had no way to know the ceremony is a Monday.
        days: ts.type?.days,
      }))

      // A person who both teaches and is enrolled sees both, with their
      // teaching first — it is the one they came for.
      //
      // Converted, not assigned: the table reads `lesson.subject.name` and the
      // API answers with `lesson.teachingAssignment.subject.name`. Assigning
      // the rows straight through type-checked — every field on
      // `ScheduleLesson` is optional — and drew a full week of dashes.
      store.lessons = [...mine.teaching, ...mine.classroom].map(
        toScheduleLesson,
      )
      return { success: true }
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memuat jadwal Anda'))
      return { success: false }
    } finally {
      store.isLoadingSchedule = false
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
      const tsPromise = timeSlotApi.getTimeSlots({
        limit: PAGINATION.REFERENCE_LIMIT,
      })
      let lessonPromise

      if (isTeacher) {
        lessonPromise = lessonService.getLessons({
          teacherId: teacherId!,
          limit: PAGINATION.REFERENCE_LIMIT,
        })
      } else {
        lessonPromise = lessonService.getLessonsByClassroom(selectedClassroomId)
      }

      const [tsRes, lessonRes] = await Promise.all([tsPromise, lessonPromise])

      store.timeSlots = (tsRes.data?.data ?? []).map((ts) => ({
        ...ts,
        type: ts.type?.code,
        isLesson: ts.type?.isLesson,
        typeName: ts.type?.name,
        // Which days the period exists on. Dropped here before, so the table
        // had no way to know the ceremony is a Monday.
        days: ts.type?.days,
      }))
      store.lessons = (Array.isArray(lessonRes.data) ? lessonRes.data : []).map(
        toScheduleLesson,
      )

      return { success: true }
    } catch (e) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal memuat jadwal pelajaran'))
      return { success: false }
    } finally {
      store.isLoadingSchedule = false
    }
  },
}
