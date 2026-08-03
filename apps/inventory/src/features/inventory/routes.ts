import type { RouteRecordRaw } from 'vue-router'

export const inventoryRoutes: RouteRecordRaw[] = [
  {
    path: '/inventory/assets',
    name: 'inventory-assets',
    component: () => import('./views/AssetListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Daftar Aset',
      description: 'Kelola dan pantau seluruh data aset sekolah.',
      breadcrumbs: [
        { title: 'Inventaris', href: '#' },
        { title: 'Daftar Aset' },
      ],
    },
  },
  {
    path: '/inventory/assets/create',
    name: 'inventory-assets-create',
    component: () => import('./views/AssetCreateView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Tambah Aset',
      description: 'Tambah data aset logistik sekolah baru.',
      breadcrumbs: [
        { title: 'Inventaris', href: '/inventory/assets' },
        { title: 'Daftar Aset', href: '/inventory/assets' },
        { title: 'Tambah Aset' },
      ],
    },
  },
  {
    path: '/inventory/assets/:id/edit',
    name: 'inventory-assets-edit',
    component: () => import('./views/AssetEditView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Ubah Detail Aset',
      description: 'Sesuaikan detail data aset logistik sekolah.',
      breadcrumbs: [
        { title: 'Inventaris', href: '/inventory/assets' },
        { title: 'Daftar Aset', href: '/inventory/assets' },
        { title: 'Ubah Detail Aset' },
      ],
    },
  },
  {
    path: '/inventory/assets/label-printing',
    name: 'inventory-assets-label-printing',
    component: () => import('./views/AssetLabelPrintView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Cetak Label',
      description: 'Pilih aset dan cetak label unit untuk ditempel.',
      breadcrumbs: [
        { title: 'Inventaris', href: '#' },
        { title: 'Cetak Label' },
      ],
    },
  },
  {
    path: '/inventory/categories',
    name: 'inventory-categories',
    component: () => import('./views/CategoryListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Kategori Aset',
      description: 'Klasifikasikan aset berdasarkan kategori.',
      breadcrumbs: [
        { title: 'Referensi', href: '#' },
        { title: 'Kategori Aset', href: '/inventory/categories' },
      ],
    },
  },
  {
    path: '/inventory/funding-sources',
    name: 'inventory-funding-sources',
    component: () => import('./views/FundingSourceListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Sumber Dana',
      description: 'Kelola data asal-usul sumber dana pembelian aset.',
      breadcrumbs: [
        { title: 'Referensi', href: '#' },
        { title: 'Sumber Dana', href: '/inventory/funding-sources' },
      ],
    },
  },
  {
    path: '/inventory/locations',
    name: 'inventory-locations',
    component: () => import('./views/LocationListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Daftar Lokasi',
      description: 'Kelola lokasi dan ruangan penempatan aset.',
      breadcrumbs: [
        { title: 'Referensi', href: '#' },
        { title: 'Daftar Lokasi', href: '/inventory/locations' },
      ],
    },
  },
  {
    path: '/inventory/conditions',
    name: 'inventory-conditions',
    component: () => import('./views/ConditionListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Kondisi Aset',
      description: 'Pantau status kelayakan dan kondisi fisik aset.',
      breadcrumbs: [
        { title: 'Referensi', href: '#' },
        { title: 'Kondisi Aset', href: '/inventory/conditions' },
      ],
    },
  },
  {
    path: '/inventory/statuses',
    name: 'inventory-statuses',
    component: () => import('./views/StatusListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Status Aset',
      description: 'Pantau status transaksi peminjaman aset.',
      breadcrumbs: [
        { title: 'Referensi', href: '#' },
        { title: 'Status Aset', href: '/inventory/statuses' },
      ],
    },
  },
  {
    path: '/inventory/loans',
    name: 'inventory-loans',
    component: () => import('./views/LoanListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Transaksi Pinjam',
      description: 'Kelola peminjaman dan pengembalian aset sekolah.',
      breadcrumbs: [
        { title: 'Inventaris', href: '#' },
        { title: 'Transaksi Peminjaman' },
      ],
    },
  },
  {
    path: '/inventory/loans/create',
    name: 'inventory-loans-create',
    component: () => import('./views/LoanCreateView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Pinjam Aset',
      description: 'Ajukan permohonan peminjaman logistik sekolah baru.',
      breadcrumbs: [
        { title: 'Inventaris', href: '/inventory/loans' },
        { title: 'Transaksi Peminjaman', href: '/inventory/loans' },
        { title: 'Pinjam Aset' },
      ],
    },
  },
  {
    path: '/inventory/history',
    name: 'inventory-history',
    component: () => import('./views/CirculationHistoryView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Riwayat Sirkulasi',
      description: 'Pantau riwayat pergerakan dan sirkulasi aset.',
      breadcrumbs: [
        { title: 'Inventaris', href: '#' },
        { title: 'Riwayat Sirkulasi' },
      ],
    },
  },
  {
    path: '/inventory/workflows',
    name: 'inventory-workflows',
    component: () => import('./views/WorkflowListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Alur Kerja (Workflow)',
      description: 'Kelola alur persetujuan peminjaman aset.',
      breadcrumbs: [
        { title: 'Inventaris', href: '#' },
        { title: 'Alur Kerja (Workflow)' },
      ],
    },
  },
  {
    path: '/inventory/approvals',
    name: 'inventory-approvals',
    component: () => import('./views/ApprovalListView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Daftar Persetujuan',
      description: 'Persetujuan pengajuan peminjaman aset sekolah.',
      breadcrumbs: [
        { title: 'Inventaris', href: '#' },
        { title: 'Daftar Persetujuan' },
      ],
    },
  },
]
