import {
  Calculator,
  CalendarCheck,
  CalendarOff,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList as LeaveTypeIcon,
  Clock,
  Coins,
  FileBarChart,
  FileText,
  LayoutDashboard,
  Lock,
  Receipt,
  ScanLine,
  Settings,
  Tablet,
  UserCheck,
  Wallet,
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

  // ──────────────────── SETTINGS ────────────────────
  {
    key: 'settings',
    label: 'Pengaturan',
    requiredPermission: 'settings.update',
    items: [
      {
        key: 'settings-system',
        title: 'Sistem',
        url: '#',
        icon: Settings,
        items: [
          {
            title: 'Pengaturan Umum',
            url: '/pengaturan/umum',
            requiredPermission: 'settings.update',
          },
        ],
      },
    ],
  },
]
