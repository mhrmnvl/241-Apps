import type { LucideIcon } from 'lucide-vue-next'
import {
  BookOpen,
  BookText,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Link2,
  ListChecks,
  Megaphone,
  School,
  Settings,
  UserCheck,
  UserRound,
  Users,
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
        title: 'Unit Sekolah',
        url: '/school-unit',
        icon: School,
        requiredPermission: 'school-units.read',
      },
    ],
  },

  // ──────────────────── ACADEMIC ────────────────────
  {
    label: 'Akademik',
    requiredPermission: 'academic-years.read',
    items: [
      {
        title: 'Kalender & Kurikulum',
        url: '#',
        icon: CalendarDays,
        items: [
          {
            title: 'Tahun Ajaran',
            url: '/akademik/tahun-ajaran',
            requiredPermission: 'academic-years.read',
          },
          {
            title: 'Semester',
            url: '/akademik/semester',
            requiredPermission: 'semesters.read',
          },
          {
            title: 'Kurikulum',
            url: '/akademik/kurikulum',
            requiredPermission: 'curricula.read',
          },
        ],
      },
      {
        title: 'Kelas',
        url: '#',
        icon: ClipboardList,
        items: [
          {
            title: 'Tingkat Kelas',
            url: '/akademik/tingkat-kelas',
            requiredPermission: 'classrooms.read',
          },
          {
            title: 'Daftar Kelas',
            url: '/akademik/kelas',
            requiredPermission: 'classrooms.read',
          },
        ],
      },
    ],
  },
  {
    label: 'Pembelajaran',
    requiredPermission: 'subjects.read',
    items: [
      {
        title: 'Materi & Jadwal',
        url: '#',
        icon: BookOpen,
        items: [
          {
            title: 'Mata Pelajaran',
            url: '/pembelajaran/mata-pelajaran',
            requiredPermission: 'subjects.read',
          },
          {
            title: 'Penugasan Mengajar',
            url: '/pembelajaran/penugasan-mengajar',
            requiredPermission: 'teaching-assignments.read',
          },
          {
            title: 'Jam Pelajaran',
            url: '/pembelajaran/jam-pelajaran',
            requiredPermission: 'time-slots.read',
          },
          {
            title: 'Jadwal Pelajaran',
            url: '/pembelajaran/jadwal-pelajaran',
            requiredPermission: 'schedules.read',
          },
        ],
      },
      {
        title: 'Penilaian',
        url: '#',
        icon: FileSpreadsheet,
        items: [
          {
            title: 'Kehadiran',
            url: '/akademik/kehadiran',
            requiredPermission: 'attendances.read',
          },
          {
            title: 'Nilai Siswa',
            url: '/akademik/student-scores',
            requiredPermission: 'student-scores.read',
          },
          {
            title: 'Rapor',
            url: '/akademik/rapor',
            requiredPermission: 'report-cards.read',
          },
        ],
      },
    ],
  },
  {
    label: 'Data Master',
    requiredPermission: 'students.read',
    items: [
      {
        title: 'Siswa',
        url: '#',
        icon: Users,
        items: [
          {
            title: 'Daftar Siswa',
            url: '/students',
            requiredPermission: 'students.read',
          },
          {
            title: 'Akun Siswa',
            url: '/students/accounts',
            requiredPermission: 'students.read',
          },
          {
            title: 'Daftar Alumni',
            url: '/alumni',
            requiredPermission: 'graduations.read',
          },
        ],
      },
      {
        title: 'Guru',
        url: '#',
        icon: UserCheck,
        items: [
          {
            title: 'Daftar Guru',
            url: '/teacher',
            requiredPermission: 'teachers.read',
          },
          {
            title: 'Akun Guru',
            url: '/teacher/accounts',
            requiredPermission: 'teachers.read',
          },
        ],
      },
    ],
  },

  // ──────────────────── PLATFORM SETTINGS ────────────────────
  {
    label: 'Pengaturan',
    requiredPermission: 'occupations.read',
    items: [
      {
        title: 'Referensi',
        url: '#',
        icon: ListChecks,
        items: [
          {
            title: 'Pekerjaan',
            url: '/occupations',
            requiredPermission: 'occupations.read',
          },
          {
            title: 'Kategori Jabatan',
            url: '/pengaturan/kategori-jabatan',
            requiredPermission: 'positions.read',
          },
          {
            title: 'Jabatan',
            url: '/pengaturan/jabatan',
            requiredPermission: 'positions.read',
          },
          {
            title: 'Status Kepegawaian',
            url: '/pengaturan/status-kepegawaian',
            requiredPermission: 'teachers.read',
          },
          {
            title: 'Tingkat Pendidikan',
            url: '/pengaturan/tingkat-pendidikan',
            requiredPermission: 'educations.read',
          },
          {
            title: 'Tipe Sekolah',
            url: '/pengaturan/tipe-sekolah',
            requiredPermission: 'school-units.read',
          },
          {
            title: 'Platform Sosial Media',
            url: '/social-medias',
            requiredPermission: 'social-media.read',
          },
          {
            title: 'Agama',
            url: '/pengaturan/religion',
            requiredPermission: 'religions.read',
          },
          {
            title: 'Golongan Darah',
            url: '/pengaturan/blood-type',
            requiredPermission: 'blood-types.read',
          },
          {
            title: 'Tingkat Prestasi',
            url: '/pengaturan/achievement-type',
            requiredPermission: 'achievement-types.read',
          },
          {
            title: 'Tipe Kalender',
            url: '/pengaturan/academic-calendar-type',
            requiredPermission: 'academic-calendar-types.read',
          },
          {
            title: 'Tipe Semester',
            url: '/academic/semester-type',
            requiredPermission: 'semesters.read',
          },
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

  // ──────────────────── COMING SOON ────────────────────
  {
    label: 'Segera Hadir',
    requiredPermission: 'announcements.read',
    items: [
      {
        title: 'Pengumuman',
        url: '/pengumuman',
        icon: Megaphone,
        requiredPermission: 'announcements.read',
      },
      {
        title: 'Berkas & Dokumen',
        url: '/files',
        icon: FolderOpen,
        requiredPermission: 'files.read',
      },
      {
        title: 'Kenaikan Kelas',
        url: '/akademik/semester/kenaikan-kelas',
        icon: GraduationCap,
        requiredPermission: 'graduations.read',
      },
      {
        title: 'Kalender Pendidikan',
        url: '/akademik/kalender-pendidikan',
        icon: CalendarDays,
        requiredPermission: 'academic-calendars.read',
      },
      {
        title: 'Kalender Kegiatan',
        url: '/akademik/kalender-kegiatan',
        icon: CalendarRange,
        requiredPermission: 'events.read',
      },
      {
        title: 'Data Orang Tua',
        url: '/data-master/orang-tua',
        icon: UserRound,
        requiredPermission: 'parents.read',
      },
      {
        title: 'Relasi Orang Tua',
        url: '/data-master/relasi-orang-tua',
        icon: Link2,
        requiredPermission: 'parents.read',
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
