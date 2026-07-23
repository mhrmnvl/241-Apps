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
  const roles = computed(() => user.value?.roles ?? [])
  // Identity-based (which schedule view this person naturally sees), not an
  // authorization gate — kept role-based on purpose.
  const isStudent = computed(() => roles.value.includes('STUDENT'))
  const isTeacher = computed(() => roles.value.includes('TEACHER'))
  // Authorization gate: only those who can edit schedules get the
  // cross-classroom picker — a teacher only browses their own.
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
    ...(isTeacher.value ? [{ title: 'Jadwal Mengajar Saya', href: '#' }] : []),
  ])

  async function fetchClassrooms() {
    if (isStudent.value || isTeacher.value) return
    const queryClassroomId = route.query.classroomId as string | undefined
    const res = await scheduleService.fetchClassroomsForAdmin(queryClassroomId)
    if (res.success && selectedClassroomId.value) {
      await fetchSchedule()
    }
  }

  async function fetchSchedule() {
    await scheduleService.fetchSchedule({
      isTeacher: isTeacher.value,
      teacherId: user.value?.teacher?.id,
      selectedClassroomId: selectedClassroomId.value,
    })
  }

  async function init() {
    if (isStudent.value && user.value?.student?.classroomId) {
      selectedClassroomId.value = user.value.student.classroomId
      await fetchSchedule()
    } else if (isTeacher.value) {
      await fetchSchedule()
    } else {
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
    isStudent,
    isTeacher,
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
