import {
  BookOpen,
  BookText,
  Briefcase,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileSpreadsheet,
  FolderOpen,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Link2,
  ListChecks,
  Megaphone,
  School,
  Settings,
  Trophy,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-vue-next'

export type {
  SubMenuItem,
  MenuItem,
  MenuSection,
} from '@/shared/types/menu.types'
import type { MenuSection } from '@/shared/types/menu.types'

export const menuSections: MenuSection[] = [
  // ──────────────────── MAIN ────────────────────
  {
    key: 'main',
    label: 'Utama',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Profil Sekolah',
        url: '/school-unit',
        icon: School,
        requiredPermission: 'school-units.read',
      },
      {
        title: 'Pengumuman',
        url: '/announcement',
        icon: Megaphone,
        requiredPermission: 'announcements.read',
      },
      {
        title: 'Berkas & Dokumen',
        url: '/files',
        icon: FolderOpen,
        requiredPermission: 'files.read',
      },
    ],
  },

  // ──────────────────── ACADEMIC ────────────────────
  {
    key: 'academic',
    label: 'Akademik',
    requiredPermission: 'academic-years.read',
    items: [
      {
        key: 'academic-calendar-semester',
        title: 'Periode Akademik',
        url: '#',
        icon: CalendarDays,
        items: [
          {
            title: 'Tahun Ajaran',
            url: '/academic/academic-year',
            requiredPermission: 'academic-years.read',
          },
          {
            title: 'Semester',
            url: '/academic/semester',
            requiredPermission: 'semesters.read',
          },
          {
            // `semesters.create`, matching the three endpoints behind this
            // page. It used to ask for `graduations.read` — promotion does
            // graduate the final year, so the intent was right, but that is a
            // read permission on another resource and authorises nothing the
            // page does. The route agrees with this now; before, the menu, the
            // route and the API each required something different.
            title: 'Kenaikan Kelas',
            url: '/academic/semester/promotion',
            requiredPermission: 'semesters.create',
          },
          {
            // Beside Kenaikan Kelas: the two halves of moving a school into
            // its next year. One sends everybody up, the other sends the top
            // year out. Alumni — the record of who left — sits under Siswa.
            title: 'Kelulusan',
            url: '/academic/graduation',
            requiredPermission: 'graduations.read',
          },
        ],
      },
      {
        key: 'academic-calendars',
        title: 'Kalender Pendidikan',
        url: '#',
        icon: CalendarRange,
        items: [
          // One calendar, not two. The school keeps a single one whose
          // entries nest: a term is a wide entry, and inside it sit the things
          // that happen — some for every class, some for one. Two menu entries
          // over two entities answering the same question left nothing to tell
          // a person which to open.
          {
            title: 'Kalender',
            url: '/academic/education-calendar',
            requiredPermission: 'academic-calendars.read',
          },
          {
            title: 'Manajemen Kalender',
            url: '/academic/education-calendar/manage',
            requiredPermission: 'academic-calendars.create',
          },
        ],
      },
      {
        key: 'academic-classroom',
        title: 'Kelas',
        url: '#',
        icon: ClipboardList,
        items: [
          {
            title: 'Tingkat Kelas',
            url: '/academic/grade',
            requiredPermission: 'classrooms.read',
          },
          {
            title: 'Daftar Kelas',
            url: '/academic/classroom',
            requiredPermission: 'classrooms.read',
          },
        ],
      },
    ],
  },

  // ──────────────────── LEARNING ────────────────────
  {
    key: 'learning',
    label: 'Pembelajaran',
    requiredPermission: 'subjects.read',
    items: [
      {
        key: 'learning-material-schedule',
        title: 'Pengajaran',
        url: '#',
        icon: BookOpen,
        items: [
          {
            title: 'Kurikulum',
            url: '/academic/curriculum',
            requiredPermission: 'curricula.read',
          },
          {
            title: 'Mata Pelajaran',
            url: '/learning/subject',
            requiredPermission: 'subjects.read',
          },
          {
            title: 'Penugasan Mengajar',
            url: '/learning/teaching-assignment',
            requiredPermission: 'teaching-assignments.read',
          },
          {
            title: 'Jam Pelajaran',
            url: '/learning/time-slot',
            requiredPermission: 'time-slots.read',
          },
          {
            title: 'Jadwal Pelajaran',
            url: '/learning/lesson',
            requiredPermission: 'schedules.read',
          },
        ],
      },
      {
        key: 'learning-assessment',
        title: 'Penilaian',
        url: '#',
        icon: FileSpreadsheet,
        items: [
          {
            title: 'Kehadiran',
            url: '/academic/attendance',
            requiredPermission: 'attendances.read',
          },
          {
            title: 'Tugas & Nilai',
            url: '/academic/student-score',
            requiredPermission: 'assessment-items.read',
          },
          {
            title: 'Rapor',
            url: '/academic/report-card',
            requiredPermission: 'report-cards.read',
          },
        ],
      },
    ],
  },

  // ──────────────────── SISWA ────────────────────
  {
    key: 'student',
    label: 'Siswa',
    requiredPermission: 'students.read',
    items: [
      {
        title: 'Daftar Siswa',
        url: '/student',
        icon: Users,
        requiredPermission: 'students.read',
      },
      {
        title: 'Akun Siswa',
        url: '/student/account',
        icon: UserRound,
        requiredPermission: 'students.read',
      },
      {
        // The record of who has left. Graduating them is Kelulusan, under
        // Periode Akademik, next to the promotion it happens alongside.
        title: 'Alumni',
        url: '/student/alumni',
        icon: GraduationCap,
        requiredPermission: 'graduations.read',
      },
      {
        title: 'Prestasi Siswa',
        url: '/achievement',
        icon: Trophy,
        requiredPermission: 'achievements.read',
      },
      {
        title: 'Data Orang Tua',
        url: '/data/parent',
        icon: UserRound,
        requiredPermission: 'parents.read',
      },
      {
        // `students.read`: the endpoint behind this screen is
        // `student-parents`, guarded by `students.*`. The menu asked for
        // `parents.read`, so someone holding one but not the other either saw
        // a link that denied them or missed a screen they could use.
        title: 'Relasi Orang Tua',
        url: '/data/parent-relation',
        icon: Link2,
        requiredPermission: 'students.read',
      },
    ],
  },

  // ──────────────────── GURU ────────────────────
  {
    key: 'teacher',
    label: 'Guru',
    requiredPermission: 'teachers.read',
    items: [
      {
        title: 'Daftar Guru',
        url: '/teacher',
        icon: UserCheck,
        requiredPermission: 'teachers.read',
      },
      {
        title: 'Akun Guru',
        url: '/teacher/account',
        icon: UserRound,
        requiredPermission: 'teachers.read',
      },
    ],
  },

  // ──────────────────── SETTINGS ────────────────────
  {
    key: 'settings',
    label: 'Pengaturan',
    requiredPermission: 'occupations.read',
    items: [
      {
        key: 'settings-employment-ref',
        title: 'Data Kepegawaian',
        url: '#',
        icon: Briefcase,
        items: [
          {
            title: 'Kategori Jabatan',
            url: '/setting/position-category',
            requiredPermission: 'positions.read',
          },
          {
            title: 'Jabatan',
            url: '/setting/position',
            requiredPermission: 'positions.read',
          },
          {
            title: 'Status Kepegawaian',
            url: '/setting/employment-type',
            requiredPermission: 'teachers.read',
          },
          {
            title: 'Pekerjaan',
            url: '/setting/occupation',
            requiredPermission: 'occupations.read',
          },
          {
            title: 'Tingkat Pendidikan',
            url: '/setting/education-level',
            requiredPermission: 'educations.read',
          },
        ],
      },
      {
        key: 'settings-academic-ref',
        title: 'Data Akademik',
        url: '#',
        icon: ListChecks,
        items: [
          {
            title: 'Tipe Semester',
            url: '/setting/semester-type',
            requiredPermission: 'semesters.read',
          },
          // "Mingguan" because these repeat every week; the holidays in
          // Kalender Pendidikan are dates. Two entries called "Hari Libur"
          // would leave nothing to tell a person which one to open.
          {
            title: 'Hari Libur Mingguan',
            url: '/setting/weekly-holiday',
            requiredPermission: 'academic-settings.read',
          },
          {
            title: 'Nilai Ketuntasan Minimum (KKM)',
            url: '/setting/passing-score',
            requiredPermission: 'academic-settings.read',
          },
          {
            title: 'Tipe Jam',
            url: '/setting/time-slot-type',
            requiredPermission: 'time-slots.read',
          },
          {
            title: 'Tipe Kalender',
            url: '/setting/academic-calendar-type',
            requiredPermission: 'academic-calendar-types.read',
          },
          {
            title: 'Tingkat Prestasi',
            url: '/setting/achievement-type',
            requiredPermission: 'achievement-types.read',
          },
          {
            title: 'Tipe Sekolah',
            url: '/setting/school-unit-type',
            requiredPermission: 'school-units.read',
          },
        ],
      },
      {
        key: 'settings-profile-ref',
        title: 'Data Profil',
        url: '#',
        icon: Globe,
        items: [
          {
            title: 'Agama',
            url: '/setting/religion',
            requiredPermission: 'religions.read',
          },
          {
            title: 'Golongan Darah',
            url: '/setting/blood-type',
            requiredPermission: 'blood-types.read',
          },
          {
            title: 'Sosial Media',
            url: '/setting/social-media',
            requiredPermission: 'social-media.read',
          },
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
            url: '/setting/user',
            requiredPermission: 'users.read',
          },
          {
            title: 'Manajemen Role',
            url: '/setting/role',
            requiredPermission: 'roles.read',
          },
          {
            title: 'Manajemen Permission',
            url: '/setting/permission',
            requiredPermission: 'permissions.manage',
          },
          {
            title: 'Log Aktivitas',
            url: '/setting/audit-log',
            requiredPermission: 'audit-logs.read',
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

  // ──────────────────── STUDENT VIEW ────────────────────
  //
  // These four entries pointed at the management screens — the attendance
  // register, the marking list, the report-card console — and the student role
  // held the permissions those screens require, over reads that ignored who
  // was asking. A student opening this menu was served every student's report
  // card.
  //
  // Each now points at a screen built for them and asks for the matching
  // `-own` permission, so the entry appears because the person may read their
  // own record, not because their role is spelled STUDENT.
  {
    key: 'student-view',
    label: 'Siswa',
    allowedRoles: ['STUDENT'],
    items: [
      {
        key: 'student-view-academic',
        title: 'Akademik Saya',
        url: '#',
        icon: BookText,
        items: [
          {
            title: 'Jadwal Pelajaran',
            url: '/academic/my/schedule',
            requiredPermission: 'schedules.read-own',
          },
          {
            title: 'Kehadiran',
            url: '/academic/my/attendance',
            requiredPermission: 'attendances.read-own',
          },
          {
            title: 'Nilai',
            url: '/academic/my/scores',
            requiredPermission: 'student-scores.read-own',
          },
          {
            title: 'Rapor',
            url: '/academic/my/report-card',
            requiredPermission: 'report-cards.read-own',
          },
        ],
      },
      {
        key: 'student-view-info',
        title: 'Informasi',
        url: '#',
        icon: Megaphone,
        items: [
          { title: 'Pengumuman', url: '/announcement' },
          { title: 'Kalender', url: '/academic/education-calendar' },
        ],
      },
    ],
  },
]
