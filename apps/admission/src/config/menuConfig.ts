import type { LucideIcon } from 'lucide-vue-next'
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Users,
  Waves,
  Settings,
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
  // ──────────────────── PENDAFTAR ────────────────────
  {
    label: 'Pendaftaran',
    allowedRoles: ['APPLICANT'],
    items: [
      {
        title: 'Status Pendaftaran',
        url: '/pendaftaran',
        icon: LayoutDashboard,
      },
      {
        title: 'Formulir',
        url: '/pendaftaran/formulir',
        icon: FileText,
      },
    ],
  },

  // ──────────────────── ADMIN PSB ────────────────────
  {
    label: 'Admin PSB',
    allowedRoles: ['ADMIN'],
    items: [
      {
        title: 'Dashboard',
        url: '/admin',
        icon: LayoutDashboard,
      },
      {
        title: 'Pendaftar',
        url: '/admin/pendaftar',
        icon: Users,
      },
      {
        title: 'Gelombang',
        url: '/admin/gelombang',
        icon: Waves,
      },
      {
        title: 'Pengumuman',
        url: '/admin/pengumuman',
        icon: Megaphone,
      },
    ],
  },
  {
    label: 'Pengaturan',
    allowedRoles: ['ADMIN'],
    items: [
      {
        title: 'Sistem',
        url: '#',
        icon: Settings,
        items: [
          {
            title: 'Profil Saya',
            url: '/profile',
          },
        ],
      },
    ],
  },
]
