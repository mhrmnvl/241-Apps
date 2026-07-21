export interface LessonClassItem {
  id: string
  name: string | null
  code: string
  displayName: string
  isActive: boolean
  classroomLevelId?: string
}

export interface Lesson {
  id?: string
  subjectId: string
  classroomId: string
  name?: string
  teacherId?: string
  timeSlotId: string
  day: string
}

export interface LessonBatchRow {
  timeSlotId: string
  subjectId: string
}

export interface LessonEditorTimeSlot {
  id: string
  name?: string
  type?: string
  isLesson?: boolean
  days?: string[]
  order?: number
  startTime?: string
  endTime?: string
}

export interface LessonEditorSubject {
  id: string
  name?: string
}

export const LESSON_TYPES = ['LESSON'] as const

export function isLessonSlot(slot: LessonEditorTimeSlot): boolean {
  // Pakai flag isLesson dari tipe; fallback ke kode lama hanya saat flag belum ada
  return slot.isLesson ?? slot.type === 'LESSON'
}

/** Shape dari response GET /schedules/classroom/:id */
export interface ScheduleResponse {
  id: string
  day: string
  timeSlotId: string
  timeSlot?: { id: string }
  teachingAssignment?: {
    subjectId: string
    subject?: { id: string }
  }
}
