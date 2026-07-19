import type { LessonClassItem } from './lesson'

export interface LessonColumnActions {
  onManageSchedule?: (classItem: LessonClassItem) => void
}
