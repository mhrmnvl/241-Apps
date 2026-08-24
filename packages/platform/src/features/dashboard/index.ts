export { dashboardService } from './services/dashboardService'
export { useDashboardStore } from './stores/dashboardStore'
export { useDashboard } from './composables/useDashboard'
export { dashboardRoutes } from './routes'
export { dashboardApi } from './api/dashboardApi'
/**
 * The institution dashboard as a component, not only as a route.
 *
 * academic-web shows it as one panel among several — a head teacher may hold
 * the school view alongside their own teaching — so it has to be mountable
 * somewhere other than at `/dashboard`.
 */
export { default as DashboardView } from './views/DashboardView.vue'
export type {
  DashboardSummary,
  DashboardStatistics,
  DashboardAcademicInfo,
  DashboardInstitution,
  DashboardDistributions,
  DashboardEvent,
  DashboardAnnouncement,
  StudentByGrade,
  TeacherByPosition,
} from './types'
