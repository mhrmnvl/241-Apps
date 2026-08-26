import { buildScheduleSheet } from '../logic/scheduleSheet'
import { scheduleService } from '../services/scheduleService'
import { useScheduleStore } from '../stores/scheduleStore'
import { DAYS } from '../types'
import type { ScheduleLessonMap } from '../types'
import { useAuthSession, useRoleGuard } from '@/features/platform/auth'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
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

  /**
   * Whether this screen is *actually* showing somebody their own week.
   *
   * Not `can('schedules.read-own')`, which was the question asked before.
   * `useRoleGuard` grants a SUPER_ADMIN every permission by design, so the
   * administrator answered yes, was sent to fetch "my teaching", has no
   * teacher record, and got nothing — and the branch returned before the
   * classroom picker was ever loaded. The one page that shows any timetable
   * showed them none, under the heading "Jadwal Mengajar".
   *
   * So it is set from what came back, not from what the caller may ask for.
   */
  const showingOwnSchedule = ref(false)
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

  /**
   * The timetable, ready to be printed or saved as a picture.
   *
   * Built here rather than in either view because both of them show the same
   * table and would otherwise each decide what its heading says — and the
   * heading is the only thing telling a reader whose week they are holding.
   */
  const scheduleSheet = computed(() =>
    buildScheduleSheet({
      // Two lines, and only what belongs on a sheet of paper: what this is,
      // then whose it is. The app's own name is not on it — somebody holding
      // the printout knows which school they are in, and the line was taking
      // the place where the name should be.
      title: showingOwnSchedule.value ? 'Jadwal Mengajar' : 'Jadwal Pelajaran',
      subtitle: showingOwnSchedule.value
        ? (user.value?.profile?.name ?? user.value?.name ?? '')
        : `Kelas ${
            selectedClassroom.value?.code ?? selectedClassroom.value?.name ?? ''
          }`.trim(),
      days: DAYS,
      timeSlots: sortedTimeSlots.value,
      lessonMap: lessonMap.value,
      isPersonal: showingOwnSchedule.value,
    }),
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
    ...(showingOwnSchedule.value ? [{ title: 'Jadwal Saya', href: '#' }] : []),
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
   * Own schedule first, then the school's — decided by asking, not by rank.
   *
   * A teacher's own week is what they came for, so it is tried first. Whether
   * they have one is a question no permission answers: an administrator holds
   * `schedules.read-own` (a super admin holds everything) and has no teaching
   * to show. So the fall-through is on the answer — nothing of my own, and I
   * may see the school's, therefore the picker.
   *
   * Someone who only has the `-own` code stays where they are and is told
   * their week is empty, which for them is true rather than a dead end.
   */
  async function init() {
    const mayBrowseClassrooms = isAdmin.value || can('schedules.read')

    if (hasOwnSchedule.value) {
      await scheduleService.fetchMySchedule()
      if (lessons.value.length > 0 || !mayBrowseClassrooms) {
        showingOwnSchedule.value = true
        return
      }
    }

    showingOwnSchedule.value = false
    if (mayBrowseClassrooms) {
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
    // a classroom's". It was called `isTeacher` and derived from a role name;
    // then from a permission, which a super admin holds without teaching
    // anything. It now says what the screen is showing.
    isPersonal: computed(() => showingOwnSchedule.value),
    isAdmin,
    user,
    DAYS,
    selectedClassroom,
    lessonMap,
    sortedTimeSlots,
    scheduleSheet,
    breadcrumbs,
    init,
    onClassroomChange,
  }
}
