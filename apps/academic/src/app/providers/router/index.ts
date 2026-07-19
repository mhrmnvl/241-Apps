import '@/shared/types/router'
import { academicCalendarRoutes } from '@/features/academic/academic-calendar'
import { eventCalendarRoutes } from '@/features/academic/event-calendar'
import { academicYearRoutes } from '@/features/academic/academic-year'
import { authRoutes } from '@/features/platform/auth'
import { classroomRoutes } from '@/features/academic/classroom'
import { classroomLevelRoutes } from '@/features/academic/classroom-level'
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
import { auditLogsRoutes } from '@/features/platform/audit-log'
import { scheduleRoutes } from '@/features/academic/schedule'
import { semesterRoutes } from '@/features/academic/semester'
import { studentRoutes } from '@/features/academic/student'
import { studentGraduationRoutes } from '@/features/academic/student-graduation'
import { studentScoreRoutes } from '@/features/academic/student-score'
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
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/platform/auth/stores/authStore'
import { authSessionService } from '@/features/platform/auth/services/authSessionService'

const ACCESS_TOKEN_KEY = 'siakad_access_token'

function readStoredAccessToken() {
  if (typeof window === 'undefined') return null

  return (
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    null
  )
}

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
    ...auditLogsRoutes,
    ...classroomRoutes,
    ...classroomLevelRoutes,
    ...profileRoutes,
    ...occupationRoutes,
    ...positionRoutes,
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
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/shared/views/NotFoundView.vue'),
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

  const hasToken = Boolean(readStoredAccessToken())

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && hasToken) {
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

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} — SIAKAD` : 'SIAKAD'
})

export default router
