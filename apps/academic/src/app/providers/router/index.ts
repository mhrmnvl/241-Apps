import '@/shared/types/router'
import { academicCalendarRoutes } from '@/features/academic/academic-calendar'
import { eventCalendarRoutes } from '@/features/academic/event-calendar'
import { academicYearRoutes } from '@/features/academic/academic-year'
import { authRoutes } from '@/features/platform/auth'
import { classroomRoutes } from '@/features/academic/classroom'
import { gradeRoutes } from '@/features/academic/grade'
import { curriculaRoutes } from '@/features/academic/curriculum'
import { curriculumSubjectRoutes } from '@/features/academic/curriculum-subject'
import { dashboardRoutes } from '@/features/platform/dashboard'
import { teacherRoutes } from '@/features/academic/teacher'
import { schoolUnitRoutes } from '@/features/platform/school-unit'
import { organizationRoutes } from '@/features/platform/organization'
import { fileRoutes } from '@/features/platform/file'
import { lessonRoutes } from '@/features/academic/lesson'
import { occupationRoutes } from '@/features/academic/occupation'
import { socialMediaRoutes } from '@/features/academic/social-media'
import { profileRoutes } from '@/features/platform/profile'
import { positionRoutes } from '@/features/academic/position'
import { userRoleRoutes } from '@/features/platform/user-role'
import { rolesRoutes } from '@/features/platform/role'
import { permissionsRoutes } from '@/features/platform/permission'
import { auditLogsRoutes } from '@/features/platform/audit-log'
import { scheduleRoutes } from '@/features/academic/schedule'
import { semesterRoutes } from '@/features/academic/semester'
import { studentRoutes } from '@/features/academic/student'
import { studentGraduationRoutes } from '@/features/academic/student-graduation'
import { studentScoreRoutes } from '@/features/academic/student-score'
import { assessmentItemRoutes } from '@/features/academic/assessment-item'
import { subjectRoutes } from '@/features/academic/subject'
import { teachingAssignmentRoutes } from '@/features/academic/teaching-assignment'
import { attendanceRoutes } from '@/features/academic/attendance'
import { timeSlotRoutes } from '@/features/academic/time-slot'
import { raporRoutes } from '@/features/academic/rapor/routes'
import { announcementRoutes } from '@/features/academic/announcement'
import { parentRoutes } from '@/features/academic/parent'
import { studentParentRoutes } from '@/features/academic/student-parent'
import { positionCategoryRoutes } from '@/features/academic/position-category'
import { employmentTypeRoutes } from '@/features/academic/employment-type'
import { educationRoutes } from '@/features/academic/education'
import { schoolUnitTypeRoutes } from '@/features/platform/school-unit-type'
import { religionRoutes } from '@/features/platform/religion'
import { bloodTypeRoutes } from '@/features/platform/blood-type'
import { achievementTypeRoutes } from '@/features/platform/achievement-type'
import { academicCalendarTypeRoutes } from '@/features/academic/academic-calendar-type'
import { semesterTypeRoutes } from '@/features/academic/semester-type'
import { settingsRoutes, useSettingsStore } from '@/features/platform/settings'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/platform/auth/stores/authStore'
import { authSessionService } from '@/features/platform/auth/services/authSessionService'
import { authConfig } from '@/features/platform/auth'
import { menuSections } from '@/config/menuConfig'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    ...dashboardRoutes,
    ...authRoutes,
    ...schoolUnitRoutes,
    ...organizationRoutes,
    ...fileRoutes,
    ...studentRoutes,
    ...studentGraduationRoutes,
    ...teacherRoutes,
    ...subjectRoutes,
    ...teachingAssignmentRoutes,
    ...attendanceRoutes,
    ...timeSlotRoutes,
    ...lessonRoutes,
    ...scheduleRoutes,
    ...academicCalendarRoutes,
    ...eventCalendarRoutes,
    ...academicYearRoutes,
    ...semesterRoutes,
    ...curriculaRoutes,
    ...curriculumSubjectRoutes,
    ...socialMediaRoutes,
    ...userRoleRoutes,
    ...rolesRoutes,
    ...permissionsRoutes,
    ...auditLogsRoutes,
    ...classroomRoutes,
    ...gradeRoutes,
    ...profileRoutes,
    ...occupationRoutes,
    ...positionRoutes,
    ...assessmentItemRoutes,
    ...studentScoreRoutes,
    ...raporRoutes,
    ...announcementRoutes,
    ...parentRoutes,
    ...studentParentRoutes,
    ...positionCategoryRoutes,
    ...employmentTypeRoutes,
    ...educationRoutes,
    ...schoolUnitTypeRoutes,
    ...religionRoutes,
    ...bloodTypeRoutes,
    ...achievementTypeRoutes,
    ...academicCalendarTypeRoutes,
    ...semesterTypeRoutes,
    ...settingsRoutes,
    {
      path: '/setting/general',
      name: 'setting-general',
      component: () =>
        import('@/features/platform/settings').then((m) => ({
          default: m.AppSettingsView,
        })),
      props: { appKey: 'ACADEMIC', menuSections },
      meta: {
        requiresAuth: true,
        requiredPermission: 'settings.update',
        title: 'Pengaturan Umum',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/features/platform/auth').then((m) => ({ default: m.NotFoundView })),
      meta: { title: 'Halaman Tidak Ditemukan' },
    },
  ],
})

router.beforeEach((to) => {
  const store = useAuthStore()
  if (!store.user) {
    const user = authSessionService.hydrateUser()
    if (user) {
      store.setUser(user)
    }
  }

  // The access token now lives in memory only (see shared/utils/api), so it is
  // gone after a reload. Use the persisted user (non-secret profile/roles) as the
  // optimistic auth gate; real enforcement stays server-side — the API layer
  // silently refreshes on 401 or logs out if the refresh cookie is invalid.
  const hasSession = Boolean(store.user)

  // Admin-toggled maintenance mode blocks everyone except SUPER_ADMIN, who
  // still needs /login reachable to authenticate and flip it back off.
  const settingsStore = useSettingsStore()
  const isMaintenanceOn = settingsStore.maintenanceMode
  const userRolesForMaintenance = store.user?.roles ?? []
  if (
    isMaintenanceOn &&
    !userRolesForMaintenance.includes('SUPER_ADMIN') &&
    to.name !== 'login' &&
    to.name !== 'maintenance'
  ) {
    return { name: 'maintenance' }
  }

  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && hasSession) {
    return { name: 'dashboard' }
  }

  const allowedRoles = to.meta.allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const user = store.user
    if (user) {
      const userRoles = user.roles ?? []
      if (userRoles.includes('SUPER_ADMIN')) return true
      const hasAccess = allowedRoles.some((r: string) => userRoles.includes(r))
      if (!hasAccess) {
        return { name: 'dashboard' }
      }
    } else {
      return { name: 'login' }
    }
  }

  // Permission gate — preferred over allowedRoles so custom roles are granted
  // access by the permissions they hold. SUPER_ADMIN always passes.
  const requiredPermission = to.meta.requiredPermission
  if (requiredPermission) {
    const user = store.user
    if (!user) return { name: 'login' }
    const userRoles = user.roles ?? []
    const userPermissions = user.permissions ?? []
    if (
      !userRoles.includes('SUPER_ADMIN') &&
      !userPermissions.includes(requiredPermission)
    ) {
      return { name: 'dashboard' }
    }
  }

  return true
})

router.afterEach((to) => {
  const appTitle = useSettingsStore().settings?.appTitle ?? authConfig.value.appTitle
  const title = to.meta.title
  document.title = title ? `${title} — ${appTitle}` : appTitle
})

export default router
