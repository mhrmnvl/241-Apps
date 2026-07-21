import type { LucideIcon } from 'lucide-vue-next'
import {
  LayoutDashboard,
  ListChecks,
  Settings,
  Package,
  ClipboardList,
  CheckSquare,
} from 'lucide-vue-next'

export interface SubMenuItem {
  title: string
  url: string
  requiredPermission?: string
  allowedRoles?: string[]
}

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredPermission?: string
  allowedRoles?: string[]
  items?: SubMenuItem[]
}

export interface MenuSection {
  label: string
  requiredPermission?: string
  allowedRoles?: string[]
  items: MenuItem[]
}

export const menuSections: MenuSection[] = [
  // ──────────────────── UTAMA ────────────────────
  {
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
    label: 'Manajemen Aset',
    requiredPermission: 'inventory.read',
    items: [
      {
        title: 'Daftar Aset',
        url: '/inventory/assets',
        icon: Package,
      },
    ],
  },
  {
    label: 'Sirkulasi Aset',
    requiredPermission: 'inventory.read',
    items: [
      {
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
    label: 'Persetujuan',
    requiredPermission: 'inventory.update',
    items: [
      {
        title: 'Persetujuan',
        url: '#',
        icon: CheckSquare,
        items: [{ title: 'Daftar Persetujuan', url: '/inventory/approvals' }],
      },
    ],
  },

  // ──────────────────── SETTINGS ────────────────────
  {
    label: 'Pengaturan',
    requiredPermission: 'inventory.read',
    items: [
      {
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
        ],
      },
    ],
  },
]
