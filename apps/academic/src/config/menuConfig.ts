import type { LucideIcon } from 'lucide-vue-next'
import {
  BookOpen,
  BookText,
  Building2,
  CalendarDays,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  UserCheck,
  Users,
  FolderOpen,
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
      {
        title: 'Pengumuman',
        url: '/pengumuman',
        icon: Megaphone,
        allowedRoles: ['ADMIN', 'TEACHER'],
      },
      {
        title: 'Berkas & Dokumen',
        url: '/files',
        icon: FolderOpen,
        allowedRoles: ['ADMIN', 'TEACHER'],
      },
      {
        title: 'Kelembagaan',
        url: '#',
        icon: Building2,
        allowedRoles: ['ADMIN', 'TEACHER'],
        items: [
          { title: 'Profil Yayasan', url: '/organization' },
          { title: 'Unit Sekolah', url: '/school-unit' },
        ],
      },
    ],
  },

  // ──────────────────── ACADEMIC ────────────────────
  {
    label: 'Akademik',
    allowedRoles: ['ADMIN', 'TEACHER'],
    items: [
      {
        title: 'Kalender & Kurikulum',
        url: '#',
        icon: CalendarDays,
        items: [
          { title: 'Tahun Ajaran', url: '/akademik/tahun-ajaran' },
          { title: 'Semester', url: '/akademik/semester' },
          { title: 'Kenaikan Kelas', url: '/akademik/semester/kenaikan-kelas' },
          { title: 'Kurikulum', url: '/akademik/kurikulum' },
          {
            title: 'Kalender Pendidikan',
            url: '/akademik/kalender-pendidikan',
          },
        ],
      },
      {
        title: 'Kelas',
        url: '#',
        icon: ClipboardList,
        items: [
          { title: 'Tingkat Kelas', url: '/akademik/tingkat-kelas' },
          { title: 'Daftar Kelas', url: '/akademik/kelas' },
          { title: 'Kalender Kegiatan', url: '/akademik/kalender-kegiatan' },
        ],
      },
    ],
  },
  {
    label: 'Pembelajaran',
    allowedRoles: ['ADMIN', 'TEACHER'],
    items: [
      {
        title: 'Materi & Jadwal',
        url: '#',
        icon: BookOpen,
        items: [
          { title: 'Mata Pelajaran', url: '/pembelajaran/mata-pelajaran' },
          {
            title: 'Penugasan Mengajar',
            url: '/pembelajaran/penugasan-mengajar',
          },
          { title: 'Jam Pelajaran', url: '/pembelajaran/jam-pelajaran' },
          { title: 'Jadwal Pelajaran', url: '/pembelajaran/jadwal-pelajaran' },
        ],
      },
      {
        title: 'Penilaian',
        url: '#',
        icon: FileSpreadsheet,
        items: [
          { title: 'Kehadiran', url: '/akademik/kehadiran' },
          { title: 'Nilai Siswa', url: '/akademik/student-scores' },
          { title: 'Rapor', url: '/akademik/rapor' },
        ],
      },
    ],
  },
  {
    label: 'Data Master',
    allowedRoles: ['ADMIN', 'TEACHER'],
    items: [
      {
        title: 'Siswa',
        url: '#',
        icon: Users,
        items: [
          { title: 'Daftar Siswa', url: '/students' },
          { title: 'Akun Siswa', url: '/students/accounts' },
          { title: 'Daftar Alumni', url: '/alumni' },
          { title: 'Data Orang Tua', url: '/data-master/orang-tua' },
          { title: 'Relasi Orang Tua', url: '/data-master/relasi-orang-tua' },
        ],
      },
      {
        title: 'Guru',
        url: '#',
        icon: UserCheck,
        items: [
          { title: 'Daftar Guru', url: '/teacher' },
          { title: 'Akun Guru', url: '/teacher/accounts' },
        ],
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
          { title: 'Pekerjaan', url: '/occupations' },
          { title: 'Kategori Jabatan', url: '/pengaturan/kategori-jabatan' },
          { title: 'Jabatan', url: '/pengaturan/jabatan' },
          {
            title: 'Status Kepegawaian',
            url: '/pengaturan/status-kepegawaian',
          },
          {
            title: 'Tingkat Pendidikan',
            url: '/pengaturan/tingkat-pendidikan',
          },
          {
            title: 'Tipe Sekolah',
            url: '/pengaturan/tipe-sekolah',
          },
          { title: 'Platform Sosial Media', url: '/social-medias' },
          { title: 'Agama', url: '/pengaturan/religion' },
          { title: 'Golongan Darah', url: '/pengaturan/blood-type' },
          { title: 'Tingkat Prestasi', url: '/pengaturan/achievement-type' },
          { title: 'Tipe Kalender', url: '/pengaturan/academic-calendar-type' },
          { title: 'Tipe Semester', url: '/academic/semester-type' },
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

  // ──────────────────── STUDENT VIEW ────────────────────
  {
    label: 'Siswa',
    allowedRoles: ['STUDENT'],
    items: [
      {
        title: 'Akademik Saya',
        url: '#',
        icon: BookText,
        items: [
          { title: 'Jadwal Pelajaran', url: '/jadwal' },
          { title: 'Kehadiran', url: '/akademik/kehadiran' },
          { title: 'Nilai', url: '/akademik/student-scores' },
          { title: 'Rapor', url: '/akademik/rapor' },
        ],
      },
      {
        title: 'Informasi',
        url: '#',
        icon: Megaphone,
        items: [
          { title: 'Pengumuman', url: '/pengumuman' },
          {
            title: 'Kalender Pendidikan',
            url: '/akademik/kalender-pendidikan',
          },
          { title: 'Kalender Kegiatan', url: '/akademik/kalender-kegiatan' },
        ],
      },
    ],
  },
]
