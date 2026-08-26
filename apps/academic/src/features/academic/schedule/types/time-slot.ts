export interface ScheduleTimeSlot {
  id: string
  name: string
  startTime: string
  endTime: string
  order?: number
  type?: string
  isLesson?: boolean
  typeName?: string
  /**
   * The days this period exists on at all. Empty means every day.
   *
   * The flag ceremony is the reason it is here: the school holds one, on a
   * Monday, and without this the timetable drew it as a band running Senin to
   * Sabtu — six ceremonies a week.
   */
  days?: string[]
}
