import {
  LayoutDashboard,
  ListChecks,
  Settings,
  Package,
  ClipboardList,
  CheckSquare,
  Printer,
} from 'lucide-vue-next'

export type {
  SubMenuItem,
  MenuItem,
  MenuSection,
} from '@/shared/types/menu.types'
import type { MenuSection } from '@/shared/types/menu.types'

export const menuSections: MenuSection[] = [
  // ──────────────────── UTAMA ────────────────────
  {
    key: 'main',
    label: 'Utama',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },

  // ──────────────────── INVENTORY ────────────────────
  {
    key: 'asset-management',
    label: 'Manajemen Aset',
    requiredPermission: 'inventory-assets.read',
    items: [
      {
        title: 'Daftar Aset',
        url: '/inventory/assets',
        icon: Package,
      },
      {
        title: 'Cetak Label',
        url: '/inventory/assets/label-printing',
        icon: Printer,
      },
    ],
  },
  {
    key: 'asset-circulation',
    label: 'Sirkulasi Aset',
    requiredPermission: 'inventory-loans.read',
    items: [
      {
        key: 'asset-circulation-loan',
        title: 'Peminjaman',
        url: '#',
        icon: ClipboardList,
        items: [
          { title: 'Transaksi Pinjam', url: '/inventory/loans' },
          { title: 'Riwayat Sirkulasi', url: '/inventory/history' },
        ],
      },
    ],
  },
  {
    key: 'approval',
    label: 'Persetujuan',
    // Reading the queue, not processing it: the screen shows what is pending,
    // and `inventory-approvals.update` is what the backend checks when the
    // administrator actually signs.
    requiredPermission: 'inventory-approvals.read',
    items: [
      {
        key: 'approval-list',
        title: 'Persetujuan',
        url: '#',
        icon: CheckSquare,
        items: [
          { title: 'Daftar Persetujuan', url: '/inventory/approvals' },
          // The page existed and was in no menu, reachable only by typing the
          // URL — which is why nobody noticed there was no way to define a
          // workflow, and therefore no approval step at all.
          {
            title: 'Alur Persetujuan',
            url: '/inventory/workflows',
            requiredPermission: 'inventory-approvals.create',
          },
        ],
      },
    ],
  },

  // ──────────────────── SETTINGS ────────────────────
  {
    key: 'settings',
    label: 'Pengaturan',
    requiredPermission: 'inventory-master-data.read',
    items: [
      {
        key: 'settings-reference',
        title: 'Referensi',
        url: '#',
        icon: ListChecks,
        items: [
          { title: 'Kategori Aset', url: '/inventory/categories' },
          { title: 'Sumber Dana', url: '/inventory/funding-sources' },
          { title: 'Daftar Lokasi', url: '/inventory/locations' },
          { title: 'Kondisi Aset', url: '/inventory/conditions' },
          { title: 'Status Aset', url: '/inventory/statuses' },
        ],
      },
      {
        key: 'settings-system',
        title: 'Sistem',
        url: '#',
        icon: Settings,
        requiredPermission: 'users.read',
        items: [
          {
            title: 'Kelola Pengguna',
            url: '/pengaturan/kelola-pengguna',
            requiredPermission: 'users.read',
          },
          {
            title: 'Manajemen Role',
            url: '/pengaturan/roles',
            requiredPermission: 'roles.read',
          },
          {
            title: 'Manajemen Permission',
            url: '/pengaturan/permissions',
            requiredPermission: 'permissions.manage',
          },
          {
            title: 'Log Aktivitas',
            url: '/pengaturan/audit-logs',
            requiredPermission: 'audit-logs.read',
          },
          {
            title: 'Pengaturan Umum',
            url: '/pengaturan/umum',
            requiredPermission: 'settings.update',
          },
        ],
      },
    ],
  },
]
