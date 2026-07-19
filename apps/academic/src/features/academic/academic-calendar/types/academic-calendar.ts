export const ACADEMIC_CALENDAR_TYPES = [
  'SEMESTER_START',
  'SEMESTER_END',
  'EXAM_MID',
  'EXAM_FINAL',
  'REGISTRATION',
  'HOLIDAY_NATIONAL',
  'HOLIDAY_WEEKLY',
  'HOLIDAY_SCHOOL',
  'STUDY',
  'OTHER',
] as const

export type AcademicCalendarType = (typeof ACADEMIC_CALENDAR_TYPES)[number]

export interface CalendarEventData {
  id: string
  title: string
  description?: string
  typeId: string
  type?: { id: string; name: string } | null
  startDate: string
  endDate: string
  academicYearId?: string
  semesterId?: string
}
