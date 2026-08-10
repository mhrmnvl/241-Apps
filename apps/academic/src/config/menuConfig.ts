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
  CalendarCheck,
  CalendarOff,
  CheckCircle2,
  ClipboardList as LeaveTypeIcon,
  FileText,
  Clock,
  Lock,
  ClipboardCheck,
  FileBarChart,
  ScanLine,
  Tablet,
  UserCheck,
  UserRound,
  Users,
  Wallet,
  Calculator,
  Receipt,
  Coins,
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
    ],
  },

  // ──────────────────── PRESENCE ────────────────────
  {
    key: 'presence',
    label: 'Presensi',
    requiredPermission: 'presence-credentials.read',
    items: [
      {
        title: 'Kehadiran Pegawai',
        url: '/presensi/kehadiran-pegawai',
        icon: ClipboardCheck,
        requiredPermission: 'presence-records.read',
      },
      {
        title: 'Rekap Bulanan',
        url: '/presensi/rekap',
        icon: FileBarChart,
        requiredPermission: 'presence-records.read',
      },
      {
        title: 'Kehadiran Saya',
        url: '/presensi/kehadiran-saya',
        icon: CalendarCheck,
        requiredPermission: 'presence-records.read-own',
      },
      {
        title: 'Izin & Cuti Saya',
        url: '/presensi/izin-saya',
        icon: FileText,
        requiredPermission: 'leave-requests.read-own',
      },
      {
        title: 'Persetujuan Izin',
        url: '/presensi/persetujuan-izin',
        icon: CheckCircle2,
        requiredPermission: 'leave-requests.approve',
      },
      {
        title: 'Jenis Izin & Cuti',
        url: '/presensi/jenis-izin',
        icon: LeaveTypeIcon,
        requiredPermission: 'leave-types.read',
      },
      {
        title: 'Penugasan Pola Kerja',
        url: '/presensi/penugasan-pola-kerja',
        icon: Clock,
        requiredPermission: 'work-patterns.read',
      },
      {
        title: 'Pola Kerja',
        url: '/presensi/pola-kerja',
        icon: Clock,
        requiredPermission: 'work-patterns.read',
      },
      {
        title: 'Hari Libur',
        url: '/presensi/hari-libur',
        icon: CalendarOff,
        requiredPermission: 'non-working-days.read',
      },
      {
        title: 'Periode Kehadiran',
        url: '/presensi/periode',
        icon: Lock,
        requiredPermission: 'presence-records.read',
      },
      {
        title: 'Kartu Presensi',
        url: '/presensi/kartu',
        icon: UserCheck,
        requiredPermission: 'presence-credentials.read',
      },
      {
        title: 'Perangkat Gerbang',
        url: '/presensi/perangkat',
        icon: Tablet,
        requiredPermission: 'presence-devices.read',
      },
      {
        title: 'Buka Kiosk',
        url: '/presensi/kiosk',
        icon: ScanLine,
        requiredPermission: 'presence-devices.read',
      },
    ],
  },

  // ──────────────────── PAYROLL ────────────────────
  // Hidden entirely for an account holding no `payroll-*` permission — the
  // section header carries the read-own code every employee gets, so the one
  // item they can open is the only one they see.
  {
    key: 'payroll',
    label: 'Penggajian',
    requiredPermission: 'payroll-payslips.read-own',
    items: [
      {
        title: 'Slip Gaji Saya',
        url: '/penggajian/slip-gaji-saya',
        icon: Receipt,
        requiredPermission: 'payroll-payslips.read-own',
      },
      {
        title: 'Perhitungan',
        url: '/penggajian/run',
        icon: Calculator,
        requiredPermission: 'payroll-runs.read',
      },
      {
        title: 'Gaji Pegawai',
        url: '/penggajian/gaji-pegawai',
        icon: Wallet,
        requiredPermission: 'payroll-salaries.read',
      },
      {
        title: 'Komponen Gaji',
        url: '/penggajian/komponen',
        icon: Coins,
        requiredPermission: 'payroll-components.read',
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
        title: 'Daftar Alumni',
        url: '/student/alumni',
        icon: GraduationCap,
        requiredPermission: 'graduations.read',
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

  // ──────────────────── COMING SOON ────────────────────
  {
    key: 'coming-soon',
    label: 'Segera Hadir',
    requiredPermission: 'announcements.read',
    items: [
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
      {
        title: 'Kenaikan Kelas',
        url: '/academic/semester/promotion',
        icon: GraduationCap,
        requiredPermission: 'graduations.read',
      },
      {
        title: 'Kalender Pendidikan',
        url: '/academic/education-calendar',
        icon: CalendarDays,
        requiredPermission: 'academic-calendars.read',
      },
      {
        title: 'Kalender Kegiatan',
        url: '/academic/event-calendar',
        icon: CalendarRange,
        requiredPermission: 'events.read',
      },
      {
        title: 'Data Orang Tua',
        url: '/data/parent',
        icon: UserRound,
        requiredPermission: 'parents.read',
      },
      {
        title: 'Relasi Orang Tua',
        url: '/data/parent-relation',
        icon: Link2,
        requiredPermission: 'parents.read',
      },
      {
        title: 'Prestasi Siswa',
        url: '/achievement',
        icon: Trophy,
        requiredPermission: 'achievements.read',
      },
    ],
  },

  // ──────────────────── STUDENT VIEW ────────────────────
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
          { title: 'Jadwal Pelajaran', url: '/schedule' },
          { title: 'Kehadiran', url: '/academic/attendance' },
          { title: 'Nilai', url: '/academic/student-score' },
          { title: 'Rapor', url: '/academic/report-card' },
        ],
      },
      {
        key: 'student-view-info',
        title: 'Informasi',
        url: '#',
        icon: Megaphone,
        items: [
          { title: 'Pengumuman', url: '/announcement' },
          {
            title: 'Kalender Pendidikan',
            url: '/academic/education-calendar',
          },
          { title: 'Kalender Kegiatan', url: '/academic/event-calendar' },
        ],
      },
    ],
  },
]
