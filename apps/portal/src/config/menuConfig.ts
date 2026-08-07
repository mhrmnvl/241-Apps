import {
  CalendarDays,
  Images,
  Megaphone,
  FileStack,
  FileText,
  FolderTree,
  Menu,
  Newspaper,
  Settings,
  Tags,
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
 *
 * Entries appear here only once their route exists. A menu item pointing at an
 * unregistered route sends the user to a 404, which reads as a broken app
 * rather than an unbuilt feature. Pengumuman joins with US10, Agenda with US9,
 * Galeri with US11, Halaman with US8, and Kategori with US5.
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
      {
        title: 'Kategori',
        url: '/admin/kategori',
        icon: FolderTree,
        requiredPermission: 'portal-categories.read',
      },
      {
        title: 'Tag',
        url: '/admin/tag',
        icon: Tags,
        requiredPermission: 'portal-tags.read',
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
    ],
  },
]
