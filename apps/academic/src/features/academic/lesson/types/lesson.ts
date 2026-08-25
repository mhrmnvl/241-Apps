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

/**
 * Baris tabel editor jadwal. Slot non-pelajaran (istirahat, upacara) dikunci
 * dan hanya ditampilkan; slot pelajaran dapat disunting per baris.
 */
export interface LockedScheduleRow {
  kind: 'locked'
  slot: LessonEditorTimeSlot
}

export interface EditableScheduleRow {
  kind: 'editable'
  rowIndex: number
}

export type ScheduleTableRow = LockedScheduleRow | EditableScheduleRow

/**
 * Shape dari response GET /schedules/classroom/:id dan /schedules/me.
 *
 * Nama mapel, kelas, dan guru semuanya menggantung di `teachingAssignment` —
 * itulah baris yang menyatakan "guru ini mengajar mapel ini di kelas ini".
 * Baris jadwal sendiri hanya menyatakan kapan.
 *
 * Sebelumnya tipe ini hanya menyebut `subjectId` dan `subject.id`, padahal
 * server mengirim jauh lebih banyak. Layar jadwal membaca nama dari sana dan
 * tidak menemukannya, dan tipe yang kekurangan field tidak bisa mengeluh.
 */
export interface ScheduleResponse {
  id: string
  day: string
  timeSlotId: string
  timeSlot?: { id: string; name?: string; order?: number }
  teachingAssignment?: {
    subjectId: string
    subject?: { id: string; name?: string }
    classroom?: { id?: string; name?: string; code?: string }
    teacher?: { id?: string; user?: { profile?: { name?: string } } }
  }
}
