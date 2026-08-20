export { academicYearApi } from './api/academicYearApi'
export { academicYearService } from './services/academicYearService'
export { useAcademicYearStore } from './stores/academicYearStore'
export { useAcademicYearList } from './composables/useAcademicYearList'
export { useAcademicYearForm } from './composables/useAcademicYearForm'
export { academicYearRoutes } from './routes'
/**
 * The weekly-holiday rule is applied wherever a date is rendered — the
 * education calendar most of all — so the numbering and the predicate are part
 * of this feature's public surface rather than private to its form.
 */
export {
  DEFAULT_WEEKLY_HOLIDAY,
  WEEKDAYS,
  formatWeeklyHolidays,
  isWeeklyHoliday,
} from './constants/weekdays'
export type {
  AcademicYear,
  AcademicYearEditData,
  AcademicYearSavePayload,
  AcademicYearCreateResponse,
  AcademicYearQueryParams,
  AcademicYearColumnActions,
} from './types'
