import type { LucideIcon } from 'lucide-vue-next'
import {
  LayoutDashboard,
  ListChecks,
  Settings,
  Package,
  ClipboardList,
  CheckSquare,
} from 'lucide-vue-next'
import type { UserRole } from '@/shared/types/router'

export interface SubMenuItem {
  title: string
  url: string
  allowedRoles?: UserRole[]
}

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  allowedRoles?: UserRole[]
  items?: SubMenuItem[]
}

export interface MenuSection {
  label: string
  allowedRoles?: UserRole[]
  items: MenuItem[]
}

export const menuSections: MenuSection[] = [
  // ──────────────────── PLATFORM ────────────────────
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
    allowedRoles: ['ADMIN', 'TEACHER', 'PRINCIPAL'],
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
    allowedRoles: ['ADMIN', 'TEACHER', 'PRINCIPAL'],
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
    allowedRoles: ['ADMIN', 'PRINCIPAL'],
    items: [
      {
        title: 'Persetujuan',
        url: '#',
        icon: CheckSquare,
        items: [{ title: 'Daftar Persetujuan', url: '/inventory/approvals' }],
      },
    ],
  },

  // ──────────────────── PLATFORM SETTINGS ────────────────────
  {
    label: 'Pengaturan',
    allowedRoles: ['ADMIN', 'TEACHER'],
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
        items: [
          {
            title: 'Kelola Pengguna',
            url: '/pengaturan/kelola-pengguna',
            allowedRoles: ['ADMIN'],
          },
          {
            title: 'Manajemen Role',
            url: '/pengaturan/roles',
            allowedRoles: ['ADMIN'],
          },
          {
            title: 'Manajemen Permission',
            url: '/pengaturan/permissions',
            allowedRoles: ['ADMIN'],
          },
          {
            title: 'Log Aktivitas',
            url: '/pengaturan/audit-logs',
            allowedRoles: ['ADMIN'],
          },
        ],
      },
    ],
  },
]
