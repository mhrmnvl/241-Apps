import type { LucideIcon } from 'lucide-vue-next'
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Users,
  Waves,
  Settings,
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
    requiredPermission: 'admissions.read',
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
        requiredPermission: 'admission-waves.read',
      },
      {
        title: 'Pengumuman',
        url: '/admin/pengumuman',
        icon: Megaphone,
        requiredPermission: 'admission-announcements.read',
      },
    ],
  },
  {
    label: 'Pengaturan',
    requiredPermission: 'profiles.read',
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
