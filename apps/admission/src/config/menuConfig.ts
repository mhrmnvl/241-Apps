import {
  LayoutDashboard,
  FileText,
  Megaphone,
  Users,
  Waves,
  Settings,
} from 'lucide-vue-next'

export type {
  SubMenuItem,
  MenuItem,
  MenuSection,
} from '@/shared/types/menu.types'
import type { MenuSection } from '@/shared/types/menu.types'

export const menuSections: MenuSection[] = [
  // ──────────────────── PENDAFTAR ────────────────────
  {
    key: 'applicant',
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
    key: 'admin-psb',
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
    key: 'settings',
    label: 'Pengaturan',
    requiredPermission: 'profiles.read',
    items: [
      {
        key: 'settings-system',
        title: 'Sistem',
        url: '#',
        icon: Settings,
        items: [
          {
            title: 'Profil Saya',
            url: '/profile',
          },
          {
            title: 'Pengaturan Umum',
            url: '/setting/general',
            requiredPermission: 'settings.update',
          },
        ],
      },
    ],
  },
]
