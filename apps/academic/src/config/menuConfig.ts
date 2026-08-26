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
        // `announcements.read-own` as well as the wide read: a student holds
        // only the first, and the noticeboard is the screen every role opens.
        title: 'Pengumuman',
        url: '/announcement',
        icon: Megaphone,
        requiredAnyPermission: ['announcements.read', 'announcements.read-own'],
      },
    ],
  },

  // ──────────────────── ACADEMIC ────────────────────
  // No gate on the section itself.
  //
  // It used to ask for `academic-years.read` — a code only the people who run
  // the school hold — which meant the calendar, the class list, the subject
  // list and a teacher's own assignments were all unreachable for a teacher,
  // though each of those entries asks for something they do have. A section
  // with nothing left in it is dropped anyway, so the items can decide.
  //
  // What that exposed had to be re-gated, and the rule is the same everywhere
  // below: an entry that exists to *change* reference data asks for the write
  // permission, not the read. Everyone needs to read the semester list to fill
  // a picker; almost nobody should be editing semesters.
  {
    key: 'academic',
    label: 'Akademik',
    items: [
      {
        key: 'academic-calendar-semester',
        title: 'Periode Akademik',
        url: '#',
        icon: CalendarDays,
        items: [
          {
            // `academic-years.update`, matching Semester below it. The read is
            // held widely — the class list shows which year a class belongs to
            // and filters by it, so a teacher opening Daftar Kelas needs it —
            // and gating the register on the read put the school's years in
            // front of everyone who looks at a class.
            title: 'Tahun Ajaran',
            url: '/academic/academic-year',
            requiredPermission: 'academic-years.update',
          },
          {
            // `semesters.update`: every screen with a class or term picker
            // reads this list, so gating the entry on `semesters.read` put the
            // school's term register in front of everyone who fills one in.
            title: 'Semester',
            url: '/academic/semester',
            requiredPermission: 'semesters.update',
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
            // Reference data behind the class list — VII, VIII, IX. Editing it
            // is a school-structure decision; reading the classes it groups is
            // not, so this asks for the write and Daftar Kelas below does not.
            title: 'Tingkat Kelas',
            url: '/academic/grade',
            requiredPermission: 'classrooms.update',
          },
          {
            title: 'Daftar Kelas',
            url: '/academic/classroom',
            requiredPermission: 'classrooms.read',
          },
        ],
      },
      {
        key: 'academic-teaching',
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
            // Two people reach this by two different permissions: whoever
            // assigns the teaching holds `teaching-assignments.read` and sees
            // the school's, and a teacher holds `.read-own` and sees theirs.
            // The screen serves both — the service asks for their own first —
            // so the entry cannot be gated on either one alone.
            title: 'Penugasan Mengajar',
            url: '/learning/teaching-assignment',
            requiredAnyPermission: [
              'teaching-assignments.read',
              'teaching-assignments.read-own',
            ],
          },
          {
            // The bell times. Every timetable renders against them — a
            // teacher's own schedule included — so the read is widely held and
            // only the editing belongs here.
            title: 'Jam Pelajaran',
            url: '/learning/time-slot',
            requiredPermission: 'time-slots.update',
          },
          {
            title: 'Jadwal Pelajaran',
            url: '/learning/lesson',
            requiredPermission: 'schedules.read',
          },
        ],
      },
    ],
  },

  // ──────────────────── PENILAIAN & RAPOR ────────────────────
  {
    key: 'assessment',
    label: 'Penilaian & Rapor',
    requiredPermission: 'attendances.read',
    items: [
      {
        key: 'assessment-attendance',
        title: 'Kehadiran',
        url: '#',
        icon: UserCheck,
        items: [
          {
            title: 'Input Kehadiran',
            url: '/academic/attendance/input',
            requiredPermission: 'attendances.manage',
          },
          {
            title: 'Rekapitulasi',
            url: '/academic/attendance/rekapitulasi',
            requiredPermission: 'attendances.read',
          },
        ],
      },
      {
        key: 'assessment-grading',
        title: 'Penilaian',
        url: '#',
        icon: FileSpreadsheet,
        items: [
          {
            title: 'Tugas',
            url: '/academic/student-score',
            requiredPermission: 'assessment-items.read',
          },
          {
            title: 'Penilaian',
            url: '/academic/assessment/penilaian',
            requiredPermission: 'student-scores.read',
          },
        ],
      },
      {
        title: 'Rapor',
        url: '/academic/report-card',
        icon: BookText,
        requiredPermission: 'report-cards.read',
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
        // Accounts, not people: this screen is where a login is disabled or a
        // password reset. `users.read` rather than `students.read`, so that
        // being allowed to look a student up does not also hand over the
        // register of their credentials — a teacher needs the first and has no
        // business with the second.
        title: 'Akun Siswa',
        url: '/student/account',
        icon: UserRound,
        requiredPermission: 'users.read',
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
        // `students.update`, though the list behind it reads with
        // `students.read`. The screen exists to tie a guardian to a child and
        // untie them again; somebody who cannot do either has nothing to do
        // here, and gating on the read put it in front of every teacher.
        //
        // Not `parents.read`, which is what it used to ask for: the endpoint
        // is `student-parents`, guarded by `students.*`, so that offered the
        // screen to people the server would refuse.
        title: 'Relasi Orang Tua',
        url: '/data/parent-relation',
        icon: Link2,
        requiredPermission: 'students.update',
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
        // Accounts, not people — see Akun Siswa.
        title: 'Akun Guru',
        url: '/teacher/account',
        icon: UserRound,
        requiredPermission: 'users.read',
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
    label: 'Milik Saya',
    // `schedules.read-own` rather than the STUDENT role.
    //
    // A teacher holds it too, and had nowhere to see their own timetable: the
    // section was addressed to a role name, so the one entry that applies to
    // both was reachable by one of them. The role is also the wrong question —
    // this school has a role called `Wali Kelas` whose holder is a teacher like
    // any other, and it would have been shut out the same way.
    //
    // Each entry below still asks for its own `-own` code, so a teacher sees
    // the timetable and nothing else: marks, attendance and rapor of one's own
    // are a student's, and a teacher holds none of those three.
    requiredPermission: 'schedules.read-own',
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
            // A student's own classroom — who runs it, who teaches it, who
            // else is in it. Daftar Kelas under Akademik is the register of
            // every class the school runs, and asks for `classrooms.read`,
            // which a student does not hold.
            title: 'Kelas Saya',
            url: '/academic/my/classroom',
            requiredPermission: 'classrooms.read-own',
          },
          {
            // The class's subjects come with the class, so this asks for the
            // same code Kelas Saya does. `teaching-assignments.read-own` means
            // "the classes I teach" — a teacher's code, which no student holds.
            title: 'Mata Pelajaran Saya',
            url: '/learning/my-subject',
            requiredPermission: 'classrooms.read-own',
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
      // Pengumuman and Kalender used to be repeated here, ungated, and both
      // bounced: the router asks for `announcements.read` and
      // `academic-calendars.read`, which the student role did not hold, so the
      // two entries a student was most likely to open were the two that threw
      // them back to the dashboard. Both codes are granted now, and both
      // screens are reached where everyone else reaches them — Kalender under
      // Akademik, Pengumuman under Utama.
    ],
  },

  // ──────────────────── AKAN DATANG ────────────────────
  //
  // Built, reachable, and not part of what the school is being shown yet.
  // Kept at the foot of the sidebar under a heading that says so, rather than
  // sitting in Utama where they read as finished work.
  {
    key: 'coming-soon',
    label: 'Akan Datang',
    items: [
      {
        title: 'Berkas & Dokumen',
        url: '/files',
        icon: FolderOpen,
        requiredPermission: 'files.read',
      },
    ],
  },
]
