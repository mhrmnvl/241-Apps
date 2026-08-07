import type { RouteRecordRaw } from 'vue-router'

export const portalAgendaRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/agenda',
    name: 'admin-agenda',
    component: () => import('./views/AgendaListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-agendas.read',
      title: 'Agenda',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Agenda' }],
    },
  },
  {
    path: '/admin/agenda/baru',
    name: 'admin-agenda-baru',
    component: () => import('./views/AgendaFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-agendas.create',
      title: 'Agenda Baru',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Agenda Baru' }],
    },
  },
  {
    path: '/admin/agenda/:id',
    name: 'admin-agenda-edit',
    component: () => import('./views/AgendaFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-agendas.update',
      title: 'Ubah Agenda',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Ubah Agenda' }],
    },
  },
]

/** Public routes, as children of the public shell (composed in the router). */
export const portalPublicAgendaRoutes: RouteRecordRaw[] = [
  {
    path: 'agenda',
    name: 'public-agenda',
    component: () => import('./views/PublicAgendaListView.vue'),
    meta: { title: 'Agenda' },
  },
  {
    path: 'agenda/:slug',
    name: 'public-agenda-detail',
    component: () => import('./views/PublicAgendaDetailView.vue'),
    meta: { title: 'Agenda' },
  },
]
