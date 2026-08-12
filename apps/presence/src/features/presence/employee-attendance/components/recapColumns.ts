import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { PresenceRecapRow } from '../types'

export const recapColumns: ColumnDef<PresenceRecapRow>[] = [
  {
    id: 'displayName',
    header: 'Nama',
    meta: { align: 'left' },
    cell: ({ row }) => row.original.displayName ?? '—',
    accessorFn: (row) => row.displayName ?? '',
  },
  {
    id: 'presentDays',
    header: 'Hadir',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.presentDays,
  },
  {
    id: 'absentDays',
    header: 'Alpa',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const val = row.original.absentDays
      return h(
        'span',
        { class: val > 0 ? 'text-red-600 font-medium' : '' },
        val,
      )
    },
  },
  {
    id: 'lateCount',
    header: 'Terlambat',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.lateCount,
  },
  {
    id: 'lateMinutes',
    header: 'Menit',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.lateMinutes,
  },
  {
    id: 'earlyLeaveCount',
    header: 'Pulang Cepat',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.earlyLeaveCount,
  },
  {
    id: 'leaveDays',
    header: 'Izin/Cuti',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.leaveDays,
  },
  {
    id: 'officialDutyDays',
    header: 'Dinas Luar',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.officialDutyDays,
  },
  {
    id: 'attendanceRate',
    header: 'Kehadiran (%)',
    meta: { align: 'center' },
    cell: ({ row }) => `${row.original.attendanceRate}%`,
  },
]
