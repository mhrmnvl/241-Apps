import { scheduleService } from '../services/scheduleService'
import { useScheduleStore } from '../stores/scheduleStore'
import { DAYS } from '../types'
import type { ScheduleLessonMap } from '../types'
import { useAuthSession, useRoleGuard } from '@/features/platform/auth'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useSchedule() {
  const route = useRoute()
  const { user } = useAuthSession()
  const store = useScheduleStore()

  const {
    classrooms,
    timeSlots,
    lessons,
    selectedClassroomId,
    isLoadingClassrooms,
    isLoadingSchedule,
  } = storeToRefs(store)

  const { can } = useRoleGuard()

  /**
   * Which affordance this person gets, decided by what they may do rather than
   * by what their role is called.
   *
   * It used to read `roles.includes('STUDENT')` and `roles.includes('TEACHER')`
   * — a check `useRoleGuard` deliberately refuses to provide, because a school
   * that invents its own roles silently fails it, and this school invents them:
   * SARPRAS exists. A teacher on a school-made role was shown the
   * administrator's classroom picker instead of their own timetable.
   *
   * Holding both is not a conflict. Someone who teaches and also administers
   * gets their own schedule and the picker, which is what they actually need.
   */
  const hasOwnSchedule = computed(() => can('schedules.read-own'))
  // Only those who can edit schedules get the cross-classroom picker — a
  // teacher browses their own.
  const isAdmin = computed(() => can('schedules.update'))

  const selectedClassroom = computed(() =>
    classrooms.value.find((c) => c.id === selectedClassroomId.value),
  )

  const lessonMap = computed<ScheduleLessonMap>(() => {
    const map: ScheduleLessonMap = {}
    for (const lesson of lessons.value) {
      const tId = lesson.timeSlotId
      if (tId) {
        map[tId] ??= {}
        map[tId][lesson.day] = lesson
      }
    }
    return map
  })

  const sortedTimeSlots = computed(() =>
    [...timeSlots.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  )

  const breadcrumbs = computed(() => [
    { title: 'Lihat Jadwal', href: '/schedule' },
    ...(selectedClassroom.value
      ? [
          {
            title:
              selectedClassroom.value.code ??
              selectedClassroom.value.name ??
              selectedClassroom.value.displayName ??
              '',
            href: '#',
          },
        ]
      : []),
    ...(hasOwnSchedule.value ? [{ title: 'Jadwal Saya', href: '#' }] : []),
  ])

  async function fetchClassrooms() {
    const queryClassroomId = route.query.classroomId as string | undefined
    const res = await scheduleService.fetchClassroomsForAdmin(queryClassroomId)
    if (res.success && selectedClassroomId.value) {
      await fetchSchedule()
    }
  }

  async function fetchSchedule() {
    await scheduleService.fetchSchedule({
      isTeacher: false,
      selectedClassroomId: selectedClassroomId.value,
    })
  }

  /**
   * Own schedule first, and the picker only for someone who administers.
   *
   * Both were unreachable before. The teacher branch needed `user.teacher.id`
   * and the student branch needed `user.student.classroomId`; nothing has ever
   * populated either, so a teacher hit the service's own guard and a student
   * fell through to a picker that returned immediately. The server resolves
   * both from the caller's records now.
   */
  async function init() {
    if (hasOwnSchedule.value) {
      await scheduleService.fetchMySchedule()
      return
    }
    if (isAdmin.value || can('schedules.read')) {
      await fetchClassrooms()
    }
  }

  async function onClassroomChange(val: unknown) {
    if (typeof val === 'string' && val) {
      selectedClassroomId.value = val
      await fetchSchedule()
    }
  }

  return {
    classrooms,
    timeSlots,
    lessons,
    selectedClassroomId,
    isLoadingClassrooms,
    isLoadingSchedule,
    hasOwnSchedule,
    // The same fact under the name the view uses: "this is your schedule, not
    // a classroom's". It was called `isTeacher` and derived from a role name.
    isPersonal: hasOwnSchedule,
    isAdmin,
    user,
    DAYS,
    selectedClassroom,
    lessonMap,
    sortedTimeSlots,
    breadcrumbs,
    init,
    onClassroomChange,
  }
}
