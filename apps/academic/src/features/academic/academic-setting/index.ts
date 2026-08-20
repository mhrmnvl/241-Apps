export { academicSettingApi } from './api/academicSettingApi'
export { academicSettingService } from './services/academicSettingService'
export { useAcademicSettingStore } from './stores/academicSettingStore'
export { useAcademicSetting } from './composables/useAcademicSetting'
export { academicSettingRoutes } from './routes'
/**
 * The weekly-holiday rule is applied wherever a date is rendered — the
 * education calendar most of all — so the numbering and the predicate are part
 * of this feature's public surface rather than private to its screen.
 */
export {
  DEFAULT_WEEKLY_HOLIDAY,
  WEEKDAYS,
  formatWeeklyHolidays,
  isWeeklyHoliday,
} from './constants/weekdays'
export type { AcademicSetting, AcademicSettingSavePayload } from './types'
