import type { RouteRecordRaw } from 'vue-router'

export const admissionRoutes: RouteRecordRaw[] = [
  // ── Publik ──
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
    },
  },
]
