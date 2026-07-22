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
    },
  },
]
