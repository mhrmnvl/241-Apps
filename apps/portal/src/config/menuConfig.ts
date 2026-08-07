import {
  CalendarDays,
  Images,
  ListChecks,
  Megaphone,
  FileStack,
  FileText,
  Menu,
  Newspaper,
  Settings,
} from 'lucide-vue-next'

export type {
  SubMenuItem,
  MenuItem,
  MenuSection,
} from '@/shared/types/menu.types'
import type { MenuSection } from '@/shared/types/menu.types'

/**
 * App-specific by design — menuConfig and AppSidebar stay in the app that owns
 * them rather than being promoted to a package.
 *
 * Every entry carries a `requiredPermission`, so a staff member with no
 * `portal-*` codes sees no management surface at all (FR-063).
 */
export const menuSections: MenuSection[] = [
  {
    key: 'content',
    label: 'Konten',
    requiredPermission: 'portal-posts.read',
    items: [
      {
        title: 'Berita',
        url: '/admin/berita',
        icon: Newspaper,
      },
      {
        title: 'Artikel',
        url: '/admin/artikel',
        icon: FileText,
      },
      {
        title: 'Pengumuman',
        url: '/admin/pengumuman',
        icon: Megaphone,
      },
      {
        title: 'Agenda',
        url: '/admin/agenda',
        icon: CalendarDays,
        requiredPermission: 'portal-agendas.read',
      },
      {
        title: 'Galeri',
        url: '/admin/galeri',
        icon: Images,
        requiredPermission: 'portal-albums.read',
      },
    ],
  },

  {
    key: 'portal-settings',
    label: 'Pengaturan Portal',
    items: [
      {
        title: 'Beranda',
        url: '/admin/beranda',
        icon: Settings,
        requiredPermission: 'portal-settings.read',
      },
      {
        title: 'Halaman',
        url: '/admin/halaman',
        icon: FileStack,
        requiredPermission: 'portal-pages.read',
      },
      {
        title: 'Menu',
        url: '/admin/menu',
        icon: Menu,
        requiredPermission: 'portal-pages.read',
      },
      {
        key: 'settings-master-data',
        title: 'Master Data',
        url: '#',
        icon: ListChecks,
        requiredPermission: 'portal-categories.read',
        items: [
          {
            title: 'Kategori',
            url: '/admin/kategori',
            requiredPermission: 'portal-categories.read',
          },
          {
            title: 'Tag',
            url: '/admin/tag',
            requiredPermission: 'portal-tags.read',
          },
        ],
      },
    ],
  },
]
