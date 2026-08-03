import type { RouteRecordRaw } from 'vue-router'

/**
 * Public pages: they carry their own chrome and must stay outside the app
 * shell, so the router registers these separately from {@link admissionRoutes}.
 */
export const admissionPublicRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('./views/LandingView.vue'),
    meta: {
      title: 'Penerimaan Santri Baru',
      description: 'Informasi pendaftaran santri baru.',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('./views/RegisterView.vue'),
    meta: {
      guestOnly: true,
      title: 'Daftar Akun',
      description: 'Buat akun pendaftaran santri baru.',
    },
  },
]

/** Routes rendered inside the app shell, as children of the layout route. */
export const admissionRoutes: RouteRecordRaw[] = [
  // ── Pendaftar ──
  {
    path: '/pendaftaran',
    name: 'applicant-dashboard',
    component: () => import('./views/ApplicantDashboardView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['APPLICANT'],
      title: 'Status Pendaftaran',
      description: 'Pantau status, notifikasi, dan pengumuman pendaftaran.',
      breadcrumbs: [{ title: 'Status Pendaftaran' }],
    },
  },
  {
    path: '/pendaftaran/formulir',
    name: 'applicant-form',
    component: () => import('./views/ApplicationFormView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['APPLICANT'],
      title: 'Formulir Pendaftaran',
      description: 'Lengkapi formulir pendaftaran santri baru.',
      breadcrumbs: [
        { title: 'Pendaftaran', href: '/pendaftaran' },
        { title: 'Formulir' },
      ],
    },
  },

  // ── Admin ──
  {
    path: '/admin',
    name: 'admin-stats',
    component: () => import('./views/AdmissionStatsView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Dashboard PSB',
      description: 'Statistik penerimaan santri baru.',
      breadcrumbs: [{ title: 'Dashboard PSB' }],
    },
  },
  {
    path: '/admin/pendaftar',
    name: 'admin-applications',
    component: () => import('./views/ApplicationListView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Daftar Pendaftar',
      description: 'Kelola dan verifikasi pendaftar santri baru.',
      breadcrumbs: [
        { title: 'Admin PSB', href: '/admin' },
        { title: 'Daftar Pendaftar' },
      ],
    },
  },
  {
    path: '/admin/pendaftar/:id',
    name: 'admin-application-detail',
    component: () => import('./views/ApplicationDetailView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Detail Pendaftar',
      description: 'Verifikasi berkas dan keputusan penerimaan.',
      breadcrumbs: [
        { title: 'Admin PSB', href: '/admin' },
        { title: 'Pendaftar', href: '/admin/pendaftar' },
        { title: 'Detail' },
      ],
    },
  },
  {
    path: '/admin/gelombang',
    name: 'admin-waves',
    component: () => import('./views/WaveListView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Gelombang Pendaftaran',
      description: 'Kelola gelombang penerimaan santri baru.',
      breadcrumbs: [
        { title: 'Admin PSB', href: '/admin' },
        { title: 'Gelombang' },
      ],
    },
  },
  {
    path: '/admin/pengumuman',
    name: 'admin-announcements',
    component: () => import('./views/AnnouncementListView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Pengumuman PSB',
      description: 'Kelola pengumuman penerimaan santri baru.',
      breadcrumbs: [
        { title: 'Admin PSB', href: '/admin' },
        { title: 'Pengumuman' },
      ],
    },
  },
]
