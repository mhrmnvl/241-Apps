import { ref, computed } from 'vue'
import { lessonService } from '../services/lessonService'
import { isLessonSlot } from '../types'
import type {
  LessonClassItem,
  LessonEditorTimeSlot,
  LessonEditorSubject,
  LessonBatchRow,
  ScheduleResponse,
} from '../types'

const DAYS = [
  { value: 'MONDAY', label: 'Senin' },
  { value: 'TUESDAY', label: 'Selasa' },
  { value: 'WEDNESDAY', label: 'Rabu' },
  { value: 'THURSDAY', label: 'Kamis' },
  { value: 'FRIDAY', label: 'Jumat' },
  { value: 'SATURDAY', label: 'Sabtu' },
]

export function useLessonEditor(classroomId: string) {
  const classroomInfo = ref<LessonClassItem | null>(null)

  const allOrderedSlots = ref<LessonEditorTimeSlot[]>([])

  const lessonSlots = computed(() => allOrderedSlots.value.filter(isLessonSlot))

  const subjects = ref<LessonEditorSubject[]>([])
  const loading = ref(true)
  const isSaving = ref<Record<string, boolean>>({})

  const schedule = ref<Record<string, LessonBatchRow[]>>(
    Object.fromEntries(DAYS.map((d) => [d.value, []])),
  )

  async function fetchData() {
    loading.value = true
    try {
      const [classroomRes, tsRes, subRes, lessonRes] = await Promise.all([
        lessonService.getClassroomById(classroomId),
        lessonService.getTimeSlots({ limit: 100 }),
        lessonService.getSubjects({ limit: 100 }),
        lessonService.getLessonsByClassroom(classroomId),
      ])

      classroomInfo.value = classroomRes.data.data ?? null

      const allSlots: LessonEditorTimeSlot[] = (tsRes.data.data ?? []).map(
        (ts) => ({ ...ts, type: ts.type?.code }),
      )
      allOrderedSlots.value = [...allSlots].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      )

      subjects.value = subRes.data.data ?? []

      const schedules: ScheduleResponse[] = lessonRes.data ?? []
      const fresh: Record<string, LessonBatchRow[]> = Object.fromEntries(
        DAYS.map((d) => [d.value, []]),
      )

      for (const s of schedules) {
        const timeSlotId = s.timeSlotId
        const subjectId =
          s.teachingAssignment?.subject?.id ?? s.teachingAssignment?.subjectId
        const dayArr = fresh[s.day]
        if (dayArr && timeSlotId && subjectId) {
          dayArr.push({ timeSlotId, subjectId })
        }
      }

      for (const day of DAYS) {
        const arr = fresh[day.value]
        if (arr) {
          arr.sort((a, b) => {
            const tsA = allOrderedSlots.value.find((t) => t.id === a.timeSlotId)
            const tsB = allOrderedSlots.value.find((t) => t.id === b.timeSlotId)
            return (tsA?.order ?? 0) - (tsB?.order ?? 0)
          })
        }
      }

      schedule.value = fresh
    } catch {
      schedule.value = Object.fromEntries(DAYS.map((d) => [d.value, []]))
    } finally {
      loading.value = false
    }
  }

  function getAvailableLessonSlotsForDay(day: string): LessonEditorTimeSlot[] {
    const slots = lessonSlots.value
    if (day !== 'MONDAY') return slots

    const hasCeremony = allOrderedSlots.value.some((s) => s.type === 'CEREMONY')
    if (!hasCeremony) return slots

    return slots.filter((s) => {
      const start = s.startTime
        ? new Date(s.startTime).toISOString().substring(11, 16)
        : ''
      return start !== '07:30' && start !== '08:00'
    })
  }

  async function saveDay(day: string) {
    const rows = schedule.value[day] ?? []

    for (const r of rows) {
      if (!r.timeSlotId || !r.subjectId) {
        lessonService.showValidationError(
          'Pastikan semua kolom Jam dan Mata Pelajaran telah terisi.',
        )
        return { success: false }
      }
    }

    isSaving.value[day] = true
    try {
      const lessonRows = rows.filter((r) => {
        const slot = allOrderedSlots.value.find((s) => s.id === r.timeSlotId)
        return slot ? isLessonSlot(slot) : true
      })
      const res = await lessonService.updateLessonBatch(
        classroomId,
        day,
        lessonRows,
      )
      return res
    } catch {
      return { success: false }
    } finally {
      isSaving.value[day] = false
    }
  }

  function addRow(day: string) {
    const currentRows = schedule.value[day] ?? []
    const usedTimeSlotIds = new Set(currentRows.map((r) => r.timeSlotId))
    const availableSlots = getAvailableLessonSlotsForDay(day)
    const nextSlot = availableSlots.find((ts) => !usedTimeSlotIds.has(ts.id))

    schedule.value[day] ??= []
    schedule.value[day].push({
      timeSlotId: nextSlot ? nextSlot.id : '',
      subjectId: '',
    })
  }

  function fillAllSlots(day: string) {
    const availableSlots = getAvailableLessonSlotsForDay(day)
    schedule.value[day] = availableSlots.map((ts) => ({
      timeSlotId: ts.id,
      subjectId: '',
    }))
  }

  function removeRow(day: string, index: number) {
    if (schedule.value[day]) {
      schedule.value[day].splice(index, 1)
    }
  }

  return {
    classroomInfo,
    allOrderedSlots,
    lessonSlots,
    getAvailableLessonSlotsForDay,
    subjects,
    schedule,
    loading,
    isSaving,
    fetchData,
    saveDay,
    DAYS,
    addRow,
    fillAllSlots,
    removeRow,
    isLessonSlot,
  }
}
